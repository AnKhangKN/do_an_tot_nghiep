import 'package:mobile/core/background/background_config.dart';
import 'package:mobile/core/socket/modules/heartbeat_socket.dart';
import 'package:mobile/core/socket/modules/location_socket.dart';
import 'package:mobile/core/socket/socket_events.dart';
import 'package:mobile/core/storage/storage_service.dart';

import '../../features/auth/data/auth_repository.dart';
import '../background/background_service.dart';
import '../location/data/location_repository.dart';
import '../socket/core_socket.dart';
import 'session_controller.dart';
import 'session_state.dart';

class AppSession {
  final SessionController controller;
  final StorageService storageService;
  final CoreSocket socket;
  final BackgroundService background;
  final AuthRepository authRepository;
  final HeartbeatSocket heartbeatSocket;
  final LocationSocket locationSocket;
  final LocationRepository locationRepository;

  AppSession({
    required this.controller,
    required this.storageService,
    required this.socket,
    required this.background,
    required this.authRepository,
    required this.heartbeatSocket,
    required this.locationSocket,
    required this.locationRepository,
  });

  // =========================
  // STATE
  // =========================
  bool _isInitialized = false;
  bool get isInitialized => _isInitialized;

  UserRole? get role => controller.state.role;
  bool get isLoggedIn => controller.state.isLoggedIn;

  bool get isRescuer => controller.state.role == UserRole.rescuer;
  bool get isVictim => controller.state.role == UserRole.victim;

  bool get isOnline => controller.state.isOnline;

  // =========================
  // Mở app hay mới đăng nhập đều phải gọi.
  // =========================
  Future<void> init() async {
    final token = await authRepository.getValidAccessToken();
    final position = await locationRepository.getCurrentLocation();

    print("Position trong app session: ${position}");
    print("Lat: ${position?.latitude}");
    print("Lng: ${position?.longitude}");

    if (token != null) {

      try {
        if (position != null) {
          controller.setPosition(position);
        }

        await socket.ensureConnected(token);

        heartbeatSocket.start();


        final profileResponse = await authRepository.getMe();

        final String roleStr = profileResponse.role;
        final UserRole userRole = roleStr == 'RESCUER'
            ? UserRole.rescuer
            : UserRole.victim;

        _isInitialized = true;
        controller.setRole(userRole);
        controller.setLoggedIn(true);

        if (userRole == UserRole.rescuer) {
          background.start();
        }
      } catch (e, stackTrace) {
        print("🚨 LỖI PHÂN QUYỀN HOẶC PARSE USER MODEL TẠI SPLASH: $e");
        print("🚨 STACK TRACE: $stackTrace");

        _isInitialized = true;
        controller.reset();
      }
    } else {
      _isInitialized = true;
      controller.setLoggedIn(false);
      controller.reset();
    }
  }

  // =========================
  // LOGOUT & DISCONNECT
  // =========================
  Future<void> stopSession() async {
    if (isOnline) {
      await goOffline();
    }

    socket.disconnect();
    await background.stop();

    controller.reset();
  }

  Future<void> logout() async {
    await stopSession();
    await storageService.clearAll();
  }

  // =========================
  // ONLINE STATE (QUAN TRỌNG NHẤT)
  // =========================
  Future<bool> goOnline() async {
    try {
      await background.start();

      final token = await authRepository.getValidAccessToken();

      if (token == null) {
        return false;
      }

      await socket.ensureConnected(token);

      socket.emit(SocketEvents.goOnline);


      // controller.setOnline(true);

      await background.updateNotification(
        title: BackgroundConfig.notificationTitle,
        content: BackgroundConfig.notificationContentGoOnline,
      );
      return true;
    } catch (e) {
      print("🚨 Go online failed: $e");
      return false;
    }
  }

  Future<bool> goOffline() async {
    try {
      if (socket.isConnected) {
        socket.emit(SocketEvents.goOffline);
      }

      // controller.setOnline(false);
      await background.updateNotification(
        title: BackgroundConfig.notificationTitle,
        content: BackgroundConfig.notificationContentOffline,
      );

      return true;
    } catch (e) {
      print("🚨 Go offline failed: $e");
      return false;
    }
  }
}
