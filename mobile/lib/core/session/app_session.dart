import 'dart:async';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:mobile/core/background/background_config.dart';
import 'package:mobile/core/socket/modules/heartbeat_socket.dart';
import 'package:mobile/core/socket/modules/location_socket.dart';
import 'package:mobile/core/socket/modules/rescuer_socket.dart';
import 'package:mobile/core/socket/socket_events.dart';
import 'package:mobile/core/storage/storage_service.dart';
import 'package:mobile/core/constants/app_constants.dart';

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
  final RescuerSocket rescuerSocket;

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
    final token = await authRepository.getValidAccessToken();
    await locationRepository.loadCurrentPosition();

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
        }
      } catch (e, stackTrace) {
        debugPrint("🚨 LỖI INIT SESSION: $e\n$stackTrace");
        _isInitialized = true;
        controller.reset();
      }
    } else {
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
      final positionStream = await locationRepository.startTracking();
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
}