import 'dart:async';

import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
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

  StreamSubscription<Position>? _locationSubscription;

  // =========================
  // Mở app hay mới đăng nhập đều phải gọi.
  // =========================
  Future<void> init() async {
    // Lấy token mới nhất
    final token = await authRepository.getValidAccessToken();

    // Lấy vị trí hiện tại lần đầu
    await locationRepository.loadCurrentPosition();

    if (token != null) {
      try {
        // Kiểm tra token để gọi socket còn dùng được không
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
    await storageService.clearAll();
    await stopSession();
  }

  // =========================
  // ONLINE STATE (QUAN TRỌNG NHẤT)
  // =========================
  Future<bool> goOnline() async {
    if (controller.isProcessing) return false;

    try {
      controller.setProcessing(true); // Khóa nút ngay lập tức

      await background.start();
      final token = await authRepository.getValidAccessToken();
      if (token == null) return false;

      await socket.ensureConnected(token);

      // 1. Gọi startTracking và hứng lấy Stream vị trí
      final positionStream = await locationRepository.startTracking();

      if (positionStream != null) {
        // Hủy sub cũ nếu có để tránh trùng lặp stream (leak bộ nhớ)
        await _locationSubscription?.cancel();

        try {
          await locationRepository.loadCurrentPosition();

          // Gửi ngay lập tức phát đầu tiên lên server và UI
          // locationSocket.sendLocation(lat: currentPos, lng: currentPos.longitude);
          debugPrint("📍 Đã gửi tọa độ khởi tạo thành công khi Go Online");
        } catch (e) {
          debugPrint("⚠️ Không lấy được tọa độ khởi tạo ngay lập tức: $e");
        }

        // 2. Lắng nghe và cập nhật vị trí trực tiếp trong Controller
        _locationSubscription = positionStream.listen((position) {
          // Hàm này vừa cập nhật UI vừa bắn Socket lên server
          locationSocket.sendLocation(
            lat: position.latitude,
            lng: position.longitude,
          );

          controller.updatePosition(position);
        });
      } else {
        print("🚨 Không có quyền truy cập vị trí.");
        return false;
      }

      socket.emit(SocketEvents.goOnline);
      controller.setOnline(true);

      await background.updateNotification(
        title: BackgroundConfig.notificationTitle,
        content: BackgroundConfig.notificationContentGoOnline,
      );

      // ⏳ Đợi đủ 2 giây Cooldown rồi mới mở khóa cho phép bấm nút Tắt
      Future.delayed(const Duration(seconds: 2), () {
        controller.setProcessing(false);
      });

      return true;
    } catch (e) {
      print("🚨 Go online failed: $e");
      return false;
    }
  }

  Future<bool> goOffline() async {
    if (controller.isProcessing) return false;
    try {
      controller.setProcessing(true); // Khóa nút ngay lập tức

      await _locationSubscription?.cancel();
      _locationSubscription = null;

      if (socket.isConnected) {
        socket.emit(SocketEvents.goOffline);
      }

      controller.setOnline(false);
      await background.updateNotification(
        title: BackgroundConfig.notificationTitle,
        content: BackgroundConfig.notificationContentOffline,
      );

      // ⏳ Đợi đủ 2 giây Cooldown rồi mới mở khóa cho phép bấm nút Tắt
      Future.delayed(const Duration(seconds: 2), () {
        controller.setProcessing(false);
      });

      return true;
    } catch (e) {
      print("🚨 Go offline failed: $e");
      return false;
    }
  }
}
