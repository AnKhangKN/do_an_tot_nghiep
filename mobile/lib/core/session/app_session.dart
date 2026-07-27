import 'dart:async';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:mobile/core/background/background_config.dart';
import 'package:mobile/core/firebase/notification_service.dart';
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

  // =========================
  // INITIALIZE SESSION
  // =========================
  Future<void> init() async {
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

        await socket.ensureConnected(
          token,
          profileResponse.userId,
          profileResponse.role,
        );

        final String roleStr = profileResponse.role;
        final UserRole userRole = roleStr == 'RESCUER'
            ? UserRole.rescuer
            : UserRole.victim;

        _isInitialized = true;
        controller.setRole(userRole);
        controller.setLoggedIn(true);

        if (userRole == UserRole.rescuer) {
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
            await socket.ensureConnected(
              newToken,
              profileResponse.userId,
              profileResponse.role,
            );

            final String roleStr = profileResponse.role;
            final UserRole userRole = roleStr == 'RESCUER'
                ? UserRole.rescuer
                : UserRole.victim;

            _isInitialized = true;
            controller.setRole(userRole);
            controller.setLoggedIn(true);

            if (userRole == UserRole.rescuer) {
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
        await storageService.clearAll();
        _isInitialized = true;
        controller.setLoggedIn(false);
        controller.reset();
      }
    } else {
      debugPrint("🎯 Không tìm thấy Token hợp lệ -> Đăng xuất người dùng về LoginScreen");
      await storageService.clearAll();
      _isInitialized = true;
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
    background.send({
      "type": "init",
      "token": token,
      "userId": userId,
      "role": role,
      "baseUrl": AppConstants.baseUrl,
    });
  }

  // =========================
  // STOP & LOGOUT
  // =========================
  Future<void> stopSession() async {
    // 1. Luôn hủy theo dõi vị trí trước tiên
    await _locationSubscription?.cancel();
    _locationSubscription = null;

    // 2. Báo offline cho server nếu đang online
    if (isOnline && socket.isConnected) {
      socket.emit(SocketEvents.goOffline);
    }

    // 3. Dừng các service
    heartbeatSocket.stop(); // (Nên có hàm stop cho heartbeat)
    socket.disconnect();
    await background.stop();

    controller.reset();
  }

  Future<void> logout() async {
    await stopSession();
    await storageService.clearAll();
  }

  // =========================
  // ONLINE STATE
  // =========================
  Future<bool> goOnline() async {
    if (controller.isProcessing) return false;

    try {
      controller.setProcessing(true);

      final token = await authRepository.getValidAccessToken();
      if (token == null) return false;

      final profileResponse = await authRepository.getMe();

      await _startBackgroundService(token, profileResponse.userId, profileResponse.role);

      // Đảm bảo socket đã kết nối
      await socket.ensureConnected(
        token,
        profileResponse.userId,
        profileResponse.role,
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

      // Bắn event lên Server
      socket.emit(SocketEvents.goOnline);
      controller.setOnline(true);

      await background.updateNotification(
        title: BackgroundConfig.notificationTitle,
        content: BackgroundConfig.notificationContentGoOnline,
      );

      await Future.delayed(const Duration(seconds: 2));
      return true;
    } catch (e) {
      debugPrint("🚨 Go online failed: $e");
      return false;
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

          final sosOffer = SOSOfferModel(
            sosId: sosId,
            victimLat: victimLat,
            victimLng: victimLng,
            description: description,
            incidentTypeName: incidentTypeName,
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