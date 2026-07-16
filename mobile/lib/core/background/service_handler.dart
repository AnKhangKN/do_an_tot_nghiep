import 'dart:async';
import 'package:flutter_background_service/flutter_background_service.dart';
import 'package:geolocator/geolocator.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

import 'background_config.dart';

class ServiceHandler {
  final ServiceInstance service;
  IO.Socket? _socket;
  String? _token;
  String? _userId;
  String? _role;
  String? _baseUrl;

  double? _lastLat;
  double? _lastLng;

  ServiceHandler(this.service);

  Timer? _timer;
  bool _running = false;

  /// =========================
  /// INIT
  /// =========================
  void init() {
    _running = true;
    _send("background_initialized");
  }

  /// =========================
  /// START LOOP
  /// =========================
  void start() {
    _running = true;

    _timer = Timer.periodic(
      Duration(seconds: BackgroundConfig.locationIntervalSeconds),
      (_) async {
        if (!_running) return;

        final location = await _getLocation();

        await _sendLocation(location);
      },
    );
  }

  /// =========================
  /// STOP
  /// =========================
  void stop() {
    _running = false;
    _timer?.cancel();

    // Ngắt kết nối socket chạy nền
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;

    service.stopSelf();
  }

  /// =========================
  /// UPDATE NOTIFICATION
  /// =========================
  void updateNotification(dynamic event) {
    final data = Map<String, dynamic>.from(event ?? {});

    final title = data["title"] ?? "Rescue Service";
    final content = data["content"] ?? "Đang hoạt động...";

    if (service is AndroidServiceInstance) {
      (service as AndroidServiceInstance).setForegroundNotificationInfo(
        title: title,
        content: content,
      );
    }
  }

  /// =========================
  /// HANDLE MESSAGE FROM MAIN
  /// =========================
  void handleMessage(dynamic event) {
    final data = Map<String, dynamic>.from(event ?? {});
    final payload = data["payload"];
    print("[BACKGROUND SERVICE] Received event: $data");
    if (payload != null && payload["type"] == "init") {
      _token = payload["token"];
      _userId = payload["userId"];
      _role = payload["role"];
      _baseUrl = payload["baseUrl"];
      print("[BACKGROUND SERVICE] Initialized with token: ${_token != null}, userId: $_userId, baseUrl: $_baseUrl");

      _connectSocket();
    }
  }

  /// =========================
  /// CONNECT BACKGROUND SOCKET
  /// =========================
  void _connectSocket() {
    _socket?.disconnect();
    _socket?.dispose();

    if (_token == null || _userId == null || _baseUrl == null) {
      print("[BACKGROUND SOCKET] Cannot connect: missing fields (token, userId, or baseUrl)");
      return;
    }

    print("[BACKGROUND SOCKET] Connecting to $_baseUrl with auth payload...");

    _socket = IO.io(
      _baseUrl,
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .enableReconnection()
          .setReconnectionDelay(2000)
          .setReconnectionDelayMax(5000)
          .setAuth({'token': _token, 'userId': _userId, 'role': _role})
          .build(),
    );

    _socket!.connect();

    _socket!.onConnect((_) {
      print("[BACKGROUND SOCKET] Connected successfully!");
      _socket!.emit("rescuer:online");
    });

    _socket!.onConnectError((e) {
      print("[BACKGROUND SOCKET] Connection error: $e");
    });

    _socket!.onDisconnect((reason) {
      print("[BACKGROUND SOCKET] Disconnected. Reason: $reason");
    });

    _socket!.onError((e) {
      print("[BACKGROUND SOCKET] Error: $e");
    });
  }

  /// =========================
  /// GET GPS (REAL / FALLBACK)
  /// =========================
  Future<Map<String, double>> _getLocation() async {
    try {
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 5),
      );
      return {
        "lat": position.latitude,
        "lng": position.longitude,
      };
    } catch (e) {
      // Fallback về tọa độ Hà Nội (Việt Nam) nếu máy ảo bị lỗi GPS
      return {
        "lat": 21.0285,
        "lng": 105.8542,
      };
    }
  }

  /// =========================
  /// SEND LOCATION
  /// =========================
  Future<void> _sendLocation(Map<String, double> loc) async {
    final double newLat = loc["lat"]!;
    final double newLng = loc["lng"]!;

    // 1. Phát ngược về Main App để cập nhật giao diện mượt mà
    service.invoke("location_update", {
      "lat": newLat,
      "lng": newLng,
    });

    // 2. Gửi trực tiếp lên server qua socket chạy nền của Isolate
    if (_socket != null && _socket!.connected) {
      bool shouldUpdateServer = true;

      if (_lastLat != null && _lastLng != null) {
        // Tính khoảng cách (mét) giữa vị trí mới và vị trí gửi lên server gần nhất
        final double distance = Geolocator.distanceBetween(
          _lastLat!,
          _lastLng!,
          newLat,
          newLng,
        );

        if (distance < BackgroundConfig.minDistanceMeters) {
          shouldUpdateServer = false;
        }
      }

      if (shouldUpdateServer) {
        _socket!.emit("rescuer:location:update", {
          "lat": newLat,
          "lng": newLng,
        });
        _lastLat = newLat;
        _lastLng = newLng;
        print("[BACKGROUND SOCKET] Sent location update (moved >= ${BackgroundConfig.minDistanceMeters}m): $newLat, $newLng");
      } else {
        print("[BACKGROUND SOCKET] Moved < ${BackgroundConfig.minDistanceMeters}m (Ignored server location update).");
      }

      // Luôn luôn gửi heartbeat để duy trì trạng thái online của cứu hộ viên trên server
      _socket!.emit("rescuer:heartbeat");
    }
  }

  /// =========================
  /// SEND BACK
  /// =========================
  void _send(String message) {
    service.invoke("status", {"message": message});
  }
}