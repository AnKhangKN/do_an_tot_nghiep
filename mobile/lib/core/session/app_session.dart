import 'dart:async';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:mobile/core/background/background_config.dart';
import 'package:mobile/core/firebase/notification_service.dart';
import 'package:mobile/core/socket/modules/ban_socket.dart';
import 'package:mobile/core/socket/modules/session_socket.dart';
import 'package:mobile/core/socket/modules/heartbeat_socket.dart';
import 'package:mobile/core/socket/modules/location_socket.dart';
import 'package:mobile/core/socket/modules/rescuer_socket.dart';
import 'package:mobile/core/socket/modules/victim_socket.dart';
import 'package:mobile/core/socket/socket_events.dart';
import 'package:mobile/core/storage/storage_service.dart';
import 'package:mobile/core/constants/app_constants.dart';
import 'package:mobile/core/di/di.dart';

import '../../features/auth/data/auth_repository.dart';
import '../background/background_service.dart';
import '../location/data/location_repository.dart';
import '../socket/core_socket.dart';
import 'session_controller.dart';
import 'session_state.dart';
import 'package:mobile/features/rescuer/presentation/providers/sos_provider.dart';
import 'package:mobile/features/rescuer/models/sos_offer_model.dart';
import 'package:latlong2/latlong.dart';
import 'package:mobile/core/theme/theme_controller.dart';
import 'package:mobile/features/chat/presentation/providers/chat_provider.dart';
import 'package:mobile/features/dangerous_points/presentation/providers/geofence_provider.dart';
import 'package:mobile/features/emergency_amenities/presentation/providers/amenity_provider.dart';
import 'package:mobile/features/notification/presentation/providers/notification_provider.dart';
import 'package:mobile/features/settings/presentation/providers/settings_provider.dart';
import 'package:mobile/features/app_report/presentation/providers/app_report_provider.dart';

class AppSession {
  final SessionController controller;
  final StorageService storageService;
  final CoreSocket socket;
  final BackgroundService background;
  final AuthRepository authRepository;
  final HeartbeatSocket heartbeatSocket;
  final LocationSocket locationSocket;
  final LocationRepository locationRepository;
  final RescuerSocket rescuerSocket;
  final VictimSocket victimSocket;
  final BanSocket banSocket;
  final SessionSocket sessionSocket;
  final NotificationService notificationService;

  AppSession({
    required this.controller,
    required this.storageService,
    required this.socket,
    required this.background,
    required this.authRepository,
    required this.heartbeatSocket,
    required this.locationSocket,
    required this.locationRepository,
    required this.rescuerSocket,
    required this.victimSocket,
    required this.banSocket,
    required this.sessionSocket,
    required this.notificationService
  });

  bool _isInitialized = false;
  bool get isInitialized => _isInitialized;

  UserRole? get role => controller.state.role;
  bool get isLoggedIn => controller.state.isLoggedIn;
  bool get isRescuer => controller.state.role == UserRole.rescuer;
  bool get isVictim => controller.state.role == UserRole.victim;
  bool get isOnline => controller.state.isOnline;

  StreamSubscription<Position>? _locationSubscription;
  String? _deviceId;

  /// Khóa chống 2 luồng logout chạy đồng thời; đồng thời là "barrier" để `init()`
  /// chờ logout xong trước khi đọc token mới (serialize logout vs login mới).
  Future<void>? _pendingLogout;

  /// Lấy deviceId cố định của thiết bị (tạo mới + lưu nếu chưa có), cache trong vòng đời app.
  Future<String> _ensureDeviceId() async {
    return _deviceId ??= await storageService.getOrCreateDeviceId();
  }

  /// Xóa sạch storage (token, theme, settings, ban state...) NHƯNG GIỮ LẠI deviceId và thông tin Guest của máy này.
  Future<void> _clearAllKeepDeviceId() async {
    final deviceId = await _ensureDeviceId();
    final guestPhone = await storageService.getGuestPhone();
    final guestSosCount = await storageService.getGuestSosCountToday();

    await storageService.clearAll();
    await storageService.clearToken();
    await storageService.saveDeviceId(deviceId);
    _deviceId = deviceId;

    if (guestPhone != null && guestPhone.trim().isNotEmpty) {
      await storageService.saveGuestPhone(guestPhone.trim());
      await storageService.restoreGuestSosCount(guestSosCount);
    }
  }

  // =========================
  // INITIALIZE SESSION
  // =========================
  Future<void> init() async {
    // 0. Nếu đang có logout đang chạy, chờ logout xong hoàn toàn (xóa sạch storage/state)
    //    trước khi đọc token, tránh đọc nhầm token cũ của tài khoản vừa logout.
    if (_pendingLogout != null) {
      await _pendingLogout;
    }

    // 1. Kiểm tra trạng thái khóa tài khoản đã lưu ở lần trước
    final wasBanned = await storageService.getIsBanned();
    if (wasBanned) {
      final banReason = await storageService.getBanReason();
      _isInitialized = true;
      controller.setBanned(reason: banReason);
      return;
    }

    // 1. Luôn tự động kiểm tra và gia hạn Access Token mới trước khi vào app
    final token = await authRepository.getValidAccessToken();
    
    // Tải vị trí và notification dịch vụ chạy song song không nghẽn tiến trình splash
    unawaited(
      locationRepository.loadCurrentPosition().timeout(
        const Duration(seconds: 4),
        onTimeout: () => debugPrint('⚠️ [Location] Tải vị trí quá thời gian 4s, bỏ qua'),
      ),
    );

    unawaited(
      notificationService.initialize().timeout(
        const Duration(seconds: 4),
        onTimeout: () => debugPrint('⚠️ [Notification] Khởi tạo notification quá thời gian 4s, bỏ qua'),
      ),
    );

    if (token != null) {
      try {
        final profileResponse = await authRepository.getMe();

        if (profileResponse.status == 'BANNED') {
          _isInitialized = true;
          controller.setBanned(reason: profileResponse.banReason);
          return;
        }

        await socket.ensureConnected(
          token,
          profileResponse.userId,
          profileResponse.role,
          deviceId: await _ensureDeviceId(),
        );

        // Đăng ký sớm để không bỏ lỡ sự kiện kick/chặn "single active session"
        // (server emit ngay sau khi kết nối)
        banSocket.listenUserBanned();
        sessionSocket.listenSessionKicked();
        sessionSocket.listenSessionBlocked();

        final String roleStr = profileResponse.role;
        final UserRole userRole = roleStr == 'RESCUER'
            ? UserRole.rescuer
            : UserRole.victim;

        final bool isGuest = profileResponse.email?.endsWith('@sos.guest') ?? false;

        _isInitialized = true;
        controller.setRole(userRole);
        controller.setIsGuest(isGuest);
        controller.setLoggedIn(true);

        if (userRole == UserRole.rescuer) {
          // Reset trạng thái online cũ (nếu DB/Redis vẫn còn ACTIVE) trước khi lắng nghe SOS
          await _resetOfflineOnStartup();
          heartbeatSocket.start();
          await _startBackgroundService(token, profileResponse.userId, profileResponse.role);
          rescuerSocket.listenSosOffer();
        } else if (userRole == UserRole.victim) {
          // Bắt đầu lắng nghe sự kiện socket dành cho Victim
          victimSocket.listenSosNotFound();
        }

        // Tự động kiểm tra và khôi phục tiến trình cứu hộ (nếu có)
        await checkAndRestoreActiveRescue();
      } catch (e, stackTrace) {
        debugPrint("🚨 [INIT SESSION] Tải profile thất bại ($e). Đang thử gia hạn Token...");
        final newToken = await authRepository.refreshToken();

        if (newToken != null) {
          try {
            final profileResponse = await authRepository.getMe();

            if (profileResponse.status == 'BANNED') {
              _isInitialized = true;
              controller.setBanned(reason: profileResponse.banReason);
              return;
            }

            await socket.ensureConnected(
              newToken,
              profileResponse.userId,
              profileResponse.role,
              deviceId: await _ensureDeviceId(),
            );

            // Đăng ký sớm để không bỏ lỡ sự kiện kick/chặn "single active session"
            banSocket.listenUserBanned();
            sessionSocket.listenSessionKicked();
            sessionSocket.listenSessionBlocked();

            final String roleStr = profileResponse.role;
            final UserRole userRole = roleStr == 'RESCUER'
                ? UserRole.rescuer
                : UserRole.victim;

            final bool isGuest = profileResponse.email?.endsWith('@sos.guest') ?? false;

            _isInitialized = true;
            controller.setRole(userRole);
            controller.setIsGuest(isGuest);
            controller.setLoggedIn(true);

            if (userRole == UserRole.rescuer) {
              // Reset trạng thái online cũ (nếu DB/Redis vẫn còn ACTIVE) trước khi lắng nghe SOS
              await _resetOfflineOnStartup();
              heartbeatSocket.start();
              await _startBackgroundService(newToken, profileResponse.userId, profileResponse.role);
              rescuerSocket.listenSosOffer();
            } else if (userRole == UserRole.victim) {
              victimSocket.listenSosNotFound();
            }

            await checkAndRestoreActiveRescue();
            return;
          } catch (err) {
            debugPrint("🚨 [INIT SESSION] Tải profile thất bại sau khi refresh: $err");
          }
        }

        // Nếu token đã hết hạn không thể gia hạn -> Đăng xuất triệt để về Login
        debugPrint("🚨 Token hết hạn không thể gia hạn -> Đăng xuất người dùng về LoginScreen");
        await _clearAllKeepDeviceId();
        _isInitialized = true;
        _resetAllProviders();
        controller.setLoggedIn(false);
        controller.reset();
      }
    } else {
      debugPrint("🎯 Không tìm thấy Token hợp lệ -> Đăng xuất người dùng về LoginScreen");
      await _clearAllKeepDeviceId();
      _isInitialized = true;
      _resetAllProviders();
      controller.setLoggedIn(false);
      controller.reset();
    }
  }

  Future<void> _startBackgroundService(
    String token,
    String userId,
    String role,
  ) async {
    await background.start();
    // Chờ 1.5 giây để background isolate khởi động và đăng ký listener xong
    await Future.delayed(const Duration(milliseconds: 1500));
    // Nếu session đã bị kết thúc (VD: bị kick/chặn do single active session) thì không khởi tạo lại background
    if (!_isInitialized) return;
    background.send({
      "type": "init",
      "token": token,
      "userId": userId,
      "role": role,
      "deviceId": await _ensureDeviceId(),
      "baseUrl": AppConstants.baseUrl,
    });
  }

  // =========================
  // STOP & LOGOUT
  // =========================

  /// Dừng toàn bộ service (GPS, heartbeat, socket, background, listener) nhưng
  /// KHÔNG reset state/storage — để logout có thể "xóa sạch trước, reset sau".
  Future<void> _stopServices() async {
    // 1. Luôn hủy theo dõi vị trí trước tiên
    await _locationSubscription?.cancel();
    _locationSubscription = null;

    // 2. Báo offline cho server nếu đang online
    if (isOnline && socket.isConnected) {
      try {
        socket.emit(SocketEvents.goOffline);
      } catch (_) {}
    }

    // 3. Dừng các service & ngắt kết nối Socket hoàn toàn
    try {
      heartbeatSocket.stop();
    } catch (_) {}

    try {
      socket.disconnect();
    } catch (_) {}

    try {
      await background.stop();
    } catch (_) {}

    try {
      banSocket.stopListening();
    } catch (_) {}

    try {
      sessionSocket.stopListening();
    } catch (_) {}
  }

  /// Reset toàn bộ provider singleton (đã đăng ký trong GetIt) về trạng thái ban đầu
  /// để không giữ bất kỳ dữ liệu nào của tài khoản cũ ("app như mới").
  void _resetAllProviders() {
    if (getIt.isRegistered<SOSProvider>()) {
      getIt<SOSProvider>().reset();
    }
    if (getIt.isRegistered<ChatProvider>()) {
      getIt<ChatProvider>().reset();
    }
    if (getIt.isRegistered<NotificationProvider>()) {
      getIt<NotificationProvider>().reset();
    }
    if (getIt.isRegistered<GeofenceProvider>()) {
      getIt<GeofenceProvider>().reset();
    }
    if (getIt.isRegistered<AmenityProvider>()) {
      getIt<AmenityProvider>().reset();
    }
    if (getIt.isRegistered<SettingsProvider>()) {
      getIt<SettingsProvider>().reset();
    }
    if (getIt.isRegistered<AppReportProvider>()) {
      getIt<AppReportProvider>().reset();
    }
    if (getIt.isRegistered<ThemeController>()) {
      getIt<ThemeController>().reset();
    }
  }

  /// Dừng toàn bộ service và reset session state (dùng khi app bị terminate).
  Future<void> stopSession() async {
    await _stopServices();
    _isInitialized = false;
    _deviceId = null;
    controller.reset();
  }

  /// Đăng xuất triệt để theo thứ tự bắt buộc: dừng services (không reset) →
  /// xóa dấu vết FCM → xóa sạch storage → reset providers → reset session.
  /// Nhờ vậy mọi luồng đọc lại token cũ (Splash `init()`, socket auto-reconnect,
  /// background isolate) đều thấy storage/state TRỐNG → không tự login tài khoản cũ
  /// → không kick thiết bị mới, không bị dính userId/role của tài khoản cũ.
  Future<void> logout() async {
    if (_pendingLogout != null) {
      return _pendingLogout!;
    }

    final future = _performLogout();
    _pendingLogout = future;
    try {
      await future;
    } finally {
      _pendingLogout = null;
    }
  }

  Future<void> _performLogout() async {
    // 1. Dừng toàn bộ service trước (không reset state)
    await _stopServices();

    // 2. Xóa dấu vết FCM của tài khoản cũ (unregister server + thu hồi token để
    //    lần đăng nhập sau được cấp token FCM mới). Chạy TRƯỚC khi xóa token local
    //    để access token cũ còn hiệu lực gọi REST. Best-effort, lỗi thì bỏ qua.
    //    GIỚI HẠN 3 giây: bước này là dọn dẹp phụ trợ, không được để logout bị treo
    //    khi mạng chậm (Dio timeout mặc định 30s).
    try {
      await notificationService
          .unregisterAndRotateToken()
          .timeout(const Duration(seconds: 3));
    } catch (e) {
      debugPrint("⚠️ [AppSession] Lỗi/quá thời gian dọn dẹp FCM khi logout: $e");
    }

    // 2.5. Gửi yêu cầu Logout lên Server dọn dẹp Redis active_session và kicked_device
    try {
      final deviceId = await _ensureDeviceId();
      await authRepository
          .logout(deviceId: deviceId)
          .timeout(const Duration(seconds: 3));
    } catch (e) {
      debugPrint("⚠️ [AppSession] Lỗi dọn dẹp Redis session khi logout: $e");
    }

    // 3. Xóa sạch toàn bộ storage: token, refreshToken, theme, settings, saved
    //    phone... ("app như mới") nhưng GIỮ deviceId để thiết bị không bị server
    //    coi là "thiết bị mới" khi đăng nhập lại (tránh kick oan single active session).
    await _clearAllKeepDeviceId();

    // 4. Reset toàn bộ provider singleton về trạng thái ban đầu
    _resetAllProviders();

    // 5. Reset session state & cờ khởi tạo (deviceId được giữ lại)
    _isInitialized = false;
    controller.reset();
  }

  // =========================
  // ONLINE STATE
  // =========================
  /// Khi vừa mở app, yêu cầu server reset trạng thái về OFFLINE nếu DB vẫn đang ACTIVE
  /// (trạng thái online cũ còn sót lại). Đảm bảo app mới mở (chưa bấm online) không
  /// bị server đẩy SOS offer. Không gây chặn init nếu lỗi/timeout.
  Future<void> _resetOfflineOnStartup() async {
    if (role != UserRole.rescuer || !socket.isConnected) return;

    try {
      final completer = Completer<void>();

      void handler(dynamic data) {
        if (data is Map && data['success'] == true) {
          completer.complete();
        } else {
          final msg = data is Map ? (data['message'] ?? 'Không thể reset offline!') : 'Không thể reset offline!';
          completer.completeError(Exception(msg));
        }
      }

      socket.on(SocketEvents.goOfflineResponse, handler);

      // Bắn event yêu cầu reset offline lên Server
      socket.emit(SocketEvents.goOffline);

      try {
        // Chờ server xác nhận, timeout 5s
        await completer.future.timeout(
          const Duration(seconds: 5),
          onTimeout: () => throw Exception('Server không phản hồi reset offline'),
        );
        debugPrint("🔄 [AppSession] Đã reset trạng thái OFFLINE khi mở app thành công.");
      } finally {
        socket.off(SocketEvents.goOfflineResponse);
      }
    } catch (e) {
      debugPrint("⚠️ [AppSession] Reset offline khi mở app không thành công (bỏ qua): $e");
    }
  }

  Future<bool> goOnline() async {
    if (controller.isProcessing) return false;

    try {
      controller.setProcessing(true);

      final token = await authRepository.getValidAccessToken();
      if (token == null) return false;

      final profileResponse = await authRepository.getMe();

      // BẢO VỆ: Chỉ cho phép bật online nếu tài khoản THỰC SỰ là RESCUER theo nguồn
      // chân lý (getMe). Phòng trường hợp màn hình rescuer bị hiển thị nhầm trong khi
      // token đang thuộc tài khoản khác (VD: victim) -> trước đây vẫn emit
      // "rescuer:online" bằng token sai -> server 404 "Không tìm thấy người cứu hộ!".
      if (profileResponse.role != 'RESCUER') {
        throw Exception(
          'Tài khoản hiện tại không phải cứu hộ viên. Vui lòng đăng xuất rồi đăng nhập lại bằng tài khoản cứu hộ!',
        );
      }

      await _startBackgroundService(token, profileResponse.userId, profileResponse.role);

      // Đảm bảo socket đã kết nối
      await socket.ensureConnected(
        token,
        profileResponse.userId,
        profileResponse.role,
        deviceId: await _ensureDeviceId(),
      );

      // QUAN TRỌNG: Tái đăng ký lắng nghe SOS đề phòng socket vừa bị reconnect/re-init
      if (profileResponse.role == 'RESCUER') {
        rescuerSocket.listenSosOffer();
        heartbeatSocket.start();
      }

      // Khởi động GPS Tracking
      final positionStream = await locationRepository.startTracking(
        distanceFilter: BackgroundConfig.minDistanceMeters.toInt(),
      );
      if (positionStream == null) {
        debugPrint("🚨 Không có quyền truy cập vị trí.");
        return false;
      }

      await _locationSubscription?.cancel();

      try {
        await locationRepository.loadCurrentPosition();
      } catch (e) {
        debugPrint("⚠️ Không lấy được tọa độ khởi tạo: $e");
      }

      _locationSubscription = positionStream.listen((position) {
        locationSocket.sendLocation(
          lat: position.latitude,
          lng: position.longitude,
        );
        controller.updatePosition(position);
      });

      // Đăng ký lắng nghe response trước khi emit
      final completer = Completer<void>();

      void handler(dynamic data) {
        if (data is Map && data['success'] == true) {
          completer.complete();
        } else {
          final msg = data is Map ? (data['message'] ?? 'Không thể online!') : 'Không thể online!';
          completer.completeError(Exception(msg));
        }
      }

      socket.on('rescuer:online:response', handler);

      // Bắn event lên Server
      socket.emit(SocketEvents.goOnline);

      try {
        // Timeout sau 10s nếu server không phản hồi
        await completer.future.timeout(
          const Duration(seconds: 10),
          onTimeout: () => throw Exception('Server không phản hồi, vui lòng thử lại!'),
        );

        controller.setOnline(true);
      } finally {
        socket.off('rescuer:online:response');
      }

      await background.updateNotification(
        title: BackgroundConfig.notificationTitle,
        content: BackgroundConfig.notificationContentGoOnline,
      );

      await Future.delayed(const Duration(seconds: 2));
      return true;
    } finally {
      // Đảm bảo luôn mở khóa nút bấm
      controller.setProcessing(false);
    }
  }

  Future<bool> goOffline() async {
    if (controller.isProcessing) return false;

    try {
      controller.setProcessing(true);

      await _locationSubscription?.cancel();
      _locationSubscription = null;

      if (socket.isConnected) {
        socket.emit(SocketEvents.goOffline);
      }

      heartbeatSocket.stop();
      controller.setOnline(false);
      await background.updateNotification(
        title: BackgroundConfig.notificationTitle,
        content: BackgroundConfig.notificationContentOffline,
      );

      await Future.delayed(const Duration(seconds: 2));
      return true;
    } catch (e) {
      debugPrint("🚨 Go offline failed: $e");
      return false;
    } finally {
      // Đảm bảo luôn mở khóa nút bấm
      controller.setProcessing(false);
    }
  }

  /// Thay đổi cấu hình distanceFilter động cho GPS Tracking (cho cả Foreground và Background)
  Future<void> updateDistanceFilter(int distanceFilter) async {
    // 1. Gửi cấu hình mới xuống Background Service (để khi app chạy nền)
    try {
      background.send({
        "type": "update_distance_filter",
        "distanceFilter": distanceFilter,
      });
    } catch (e) {
      debugPrint("⚠️ Lỗi cập nhật distanceFilter cho background service: $e");
    }

    // 2. Cập nhật cho foreground subscription (khi app đang chạy và online)
    if (_locationSubscription != null) {
      debugPrint("🔄 Cập nhật distanceFilter foreground thành: ${distanceFilter}m");
      await _locationSubscription?.cancel();
      _locationSubscription = null;

      final positionStream = await locationRepository.startTracking(distanceFilter: distanceFilter);
      if (positionStream != null) {
        _locationSubscription = positionStream.listen((position) {
          locationSocket.sendLocation(
            lat: position.latitude,
            lng: position.longitude,
          );
          controller.updatePosition(position);
        });
      }
    }
  }

  /// Tự động kiểm tra và khôi phục ca cứu hộ đang dở dang trên server
  Future<void> checkAndRestoreActiveRescue() async {
    // Không khôi phục nếu đã bị kick/chặn (single active session) hoặc không còn đăng nhập
    if (controller.kickedMessage != null || !controller.isLoggedIn) return;

    try {
      final activeRescueData = await authRepository.getActiveSOS();
      if (activeRescueData == null || activeRescueData['sosRequest'] == null) {
        // Nếu trên server không còn ca cứu hộ nào active, tự động tắt trạng thái cứu hộ ở local
        if (role == UserRole.victim && controller.isBeingRescued) {
          controller.endBeingRescued();
          controller.setSearchingRescuer(false);
          debugPrint("🔄 [AppSession] Ca cứu hộ đã kết thúc trên server. Đã tắt màn hình cứu hộ của Victim.");
        } else if (role == UserRole.rescuer && getIt<SOSProvider>().isRescuing) {
          getIt<SOSProvider>().endRescue();
          debugPrint("🔄 [AppSession] Ca cứu hộ đã kết thúc trên server. Đã tắt màn hình cứu hộ của Rescuer.");
        }
        return;
      }

      final sosRequest = activeRescueData['sosRequest'];
      final partner = activeRescueData['partner'];

      final status = sosRequest['status'];

      if (role == UserRole.rescuer) {
        if (status == 'IN_PROGRESS') {
          final sosId = sosRequest['sosRequestId'] ?? sosRequest['sos_request_id'];
          final victimLat = (sosRequest['victimLat'] ?? sosRequest['victim_lat'] as num).toDouble();
          final victimLng = (sosRequest['victimLng'] ?? sosRequest['victim_lng'] as num).toDouble();
          final description = sosRequest['description'];
          final incidentTypeName = sosRequest['incidentTypeName'] ?? sosRequest['incident_type_name'];
          final imageUrl = (sosRequest['imageUrl'] ??
                  sosRequest['image_url'] ??
                  partner?['imageUrl'] ??
                  partner?['image_url'])
              ?.toString();

          final sosOffer = SOSOfferModel(
            sosId: sosId,
            victimLat: victimLat,
            victimLng: victimLng,
            description: description,
            incidentTypeName: incidentTypeName,
            imageUrl: imageUrl,
          );

          // Cập nhật SOSProvider của Rescuer
          getIt<SOSProvider>().startRescue(sosOffer, partner ?? {});

          // Bắt đầu định vị 1m/lần
          await goOnline();
          await updateDistanceFilter(1);
          debugPrint("🔄 [AppSession] Đã khôi phục ca cứu hộ dở dang cho Rescuer. SOS: $sosId");
        }
      } else if (role == UserRole.victim) {
        if (status == 'PENDING' || status == 'SEARCHING') {
          controller.setSearchingRescuer(true);
          debugPrint("🔄 [AppSession] Đã khôi phục trạng thái đang tìm kiếm cứu hộ cho Victim.");
        } else if (status == 'ASSIGNED' || status == 'IN_PROGRESS') {
          LatLng? initialPos;
          if (partner != null && partner['lat'] != null && partner['lng'] != null) {
            initialPos = LatLng(
              (partner['lat'] as num).toDouble(),
              (partner['lng'] as num).toDouble(),
            );
          }
          controller.startBeingRescued(partner ?? {}, initialPos);
          
          // Bật lại định vị mượt mà cho Victim nếu cần (ở đây là nhận vị trí mượt)
          debugPrint("🔄 [AppSession] Đã khôi phục trạng thái đang được cứu hộ cho Victim.");
        } else if (status == 'DONE' || status == 'CANCELLED') {
          controller.endBeingRescued();
          controller.setSearchingRescuer(false);
        }
      }
    } catch (e) {
      debugPrint("⚠️ Lỗi khôi phục ca cứu hộ: $e");
    }
  }
}