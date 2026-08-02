import 'dart:async';
import 'package:flutter_background_service/flutter_background_service.dart';
import 'package:geolocator/geolocator.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:mobile/core/storage/offline_queue_service.dart';

import 'background_config.dart';

class ServiceHandler {
  final ServiceInstance service;
  IO.Socket? _socket;
  String? _token;
  String? _userId;
  String? _role;
  String? _baseUrl;
  String? _deviceId;

  // Quản lý định vị Stream và Heartbeat
  StreamSubscription<Position>? _positionSubscription;
  Timer? _heartbeatTimer;
  bool _running = false;

  // Quản lý hàng đợi offline
  final OfflineQueueService _offlineQueue = OfflineQueueService();

  ServiceHandler(this.service);

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

    // 1. Đăng ký lắng nghe Stream định vị
    _restartPositionStream(BackgroundConfig.minDistanceMeters.toInt());

    // 2. Chạy Timer gửi Heartbeat định kỳ độc lập mỗi 15 giây để duy trì trạng thái online
    _heartbeatTimer = Timer.periodic(const Duration(seconds: 15), (_) {
      if (!_running) return;

      if (_socket != null && _socket!.connected) {
        _socket!.emit("rescuer:heartbeat");
        print("[BACKGROUND SOCKET] Gửi heartbeat định kỳ 15s");
      }
    });
  }

  /// =========================
  /// STOP
  /// =========================
  void stop() {
    _running = false;
    _positionSubscription?.cancel();
    _positionSubscription = null;
    _heartbeatTimer?.cancel();
    _heartbeatTimer = null;

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
      _deviceId = payload["deviceId"];
      print("[BACKGROUND SERVICE] Initialized with token: ${_token != null}, userId: $_userId, baseUrl: $_baseUrl");

      _connectSocket();
    } else if (payload != null && payload["type"] == "update_distance_filter") {
      final newFilter = payload["distanceFilter"] as int? ?? BackgroundConfig.minDistanceMeters.toInt();
      print("[BACKGROUND SERVICE] Updating distanceFilter to: $newFilter meters");
      _restartPositionStream(newFilter);
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
          .setAuth({'token': _token, 'userId': _userId, 'role': _role, 'deviceId': _deviceId})
          .build(),
    );

    _socket!.connect();

    _socket!.onConnect((_) async {
      print("[BACKGROUND SOCKET] Connected successfully!");
      // _socket!.emit("rescuer:online");
      await _syncPendingLocations();
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
  Future<Map<String, double>?> _getLocation() async {
    try {
      // 1. Thử lấy vị trí gần nhất trong cache (cực nhanh, không bao giờ timeout)
      final lastPosition = await Geolocator.getLastKnownPosition();
      if (lastPosition != null) {
        // Nếu vị trí cache còn mới (dưới 15 giây), dùng luôn để tiết kiệm pin và tránh timeout
        final age = DateTime.now().difference(lastPosition.timestamp);
        if (age.inSeconds < 15) {
          return {
            "lat": lastPosition.latitude,
            "lng": lastPosition.longitude,
          };
        }
      }

      // 2. Yêu cầu vị trí mới với timeout dài hơn (12 giây) để GPS kịp bắt sóng dưới nền
      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 12),
        ),
      );
      return {
        "lat": position.latitude,
        "lng": position.longitude,
      };
    } catch (e) {
      print("[BACKGROUND SERVICE] Lỗi lấy GPS: $e");
      // Fallback về vị trí cache cũ nếu có thay vì trả về null ngay lập tức
      try {
        final lastPosition = await Geolocator.getLastKnownPosition();
        if (lastPosition != null) {
          print("[BACKGROUND SERVICE] Fallback sử dụng vị trí cache cũ.");
          return {
            "lat": lastPosition.latitude,
            "lng": lastPosition.longitude,
          };
        }
      } catch (_) {}
      return null;
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
      _socket!.emit("rescuer:location:update", {
        "lat": newLat,
        "lng": newLng,
      });
      print("[BACKGROUND SOCKET] Đã gửi vị trí mới lên server: $newLat, $newLng");
    } else {
      // Ngoại tuyến: Lưu tạm tọa độ vào database local
      await _offlineQueue.queueTask("location_sync", {
        "lat": newLat,
        "lng": newLng,
      });
      print("[BACKGROUND SERVICE] Socket offline. Đã xếp hàng tọa độ ngoại tuyến.");
    }
  }

  /// =========================
  /// ĐỒNG BỘ TỌA ĐỘ NGOẠI TUYẾN
  /// =========================
  Future<void> _syncPendingLocations() async {
    final pendingTasks = await _offlineQueue.getPendingTasks();
    final locationTasks = pendingTasks.where((t) => t['type'] == 'location_sync').toList();

    if (locationTasks.isEmpty) return;

    print("[BACKGROUND SERVICE] Phát hiện ${locationTasks.length} tọa độ ngoại tuyến chưa đồng bộ. Bắt đầu gửi bù...");

    for (var task in locationTasks) {
      if (_socket == null || !_socket!.connected) break;

      final data = Map<String, dynamic>.from(task['data']);
      
      _socket!.emit("rescuer:location:update", {
        "lat": data["lat"],
        "lng": data["lng"],
        "offlineTime": task["createdAt"] // Gửi kèm thời gian thực tế đo được để server lưu trữ chính xác
      });

      await _offlineQueue.removeTask(task['id']);
    }

    print("[BACKGROUND SERVICE] Đồng bộ tọa độ ngoại tuyến hoàn tất.");
  }

  void _restartPositionStream(int filter) {
    _positionSubscription?.cancel();
    _positionSubscription = Geolocator.getPositionStream(
      locationSettings: AndroidSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: filter,
        intervalDuration: const Duration(seconds: 1), // Quét định vị nền mỗi 1 giây để di chuyển liên tục
      ),
    ).listen(
      (Position position) async {
        if (!_running) return;

        print("[BACKGROUND SERVICE] Stream nhận tọa độ mới: ${position.latitude}, ${position.longitude}");
        await _sendLocation({
          "lat": position.latitude,
          "lng": position.longitude,
        });
      },
      onError: (error) {
        print("[BACKGROUND SERVICE] Lỗi Stream GPS: $error");
      },
    );
  }

  /// =========================
  /// SEND BACK
  /// =========================
  void _send(String message) {
    service.invoke("status", {"message": message});
  }
}