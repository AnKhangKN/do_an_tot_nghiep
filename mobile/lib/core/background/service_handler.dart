import 'dart:async';
import 'package:flutter_background_service/flutter_background_service.dart';

import 'background_config.dart';

class ServiceHandler {
  final ServiceInstance service;

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
    // ví dụ update config runtime
    // socket token update, etc
  }

  /// =========================
  /// MOCK GPS
  /// =========================
  Future<Map<String, double>> _getLocation() async {
    // TODO: integrate geolocator / background_locator
    return {
      "lat": 10.0452,
      "lng": 105.7469,
    };
  }

  /// =========================
  /// SEND LOCATION
  /// =========================
  Future<void> _sendLocation(Map<String, double> loc) async {
    service.invoke("location_update", {
      "lat": loc["lat"],
      "lng": loc["lng"],
    });
  }

  /// =========================
  /// SEND BACK
  /// =========================
  void _send(String message) {
    service.invoke("status", {"message": message});
  }
}