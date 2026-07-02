import 'dart:isolate';
import 'package:flutter/foundation.dart';
import 'package:flutter_background_service/flutter_background_service.dart';
import 'package:flutter_background_service_android/flutter_background_service_android.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

import 'background_config.dart';
import 'background_entrypoint.dart';

class BackgroundService {
  static final BackgroundService _instance = BackgroundService._internal();
  factory BackgroundService() => _instance;
  BackgroundService._internal();

  final FlutterBackgroundService _service = FlutterBackgroundService();

  bool _configured = false;

  /// =========================
  /// INIT CONFIG (CHỈ 1 LẦN)
  /// =========================
  Future<void> initialize() async {
    if (_configured) return;

    debugPrint("🚀 Configuring Background Service...");

    // =========================
    // NOTIFICATION CHANNEL
    // =========================
    const AndroidNotificationChannel channel = AndroidNotificationChannel(
      BackgroundConfig.channelId,
      BackgroundConfig.channelName,
      description: BackgroundConfig.channelDesc,
      importance: Importance.high,
    );

    final notifications = FlutterLocalNotificationsPlugin();

    await notifications
        .resolvePlatformSpecificImplementation<
        AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(channel);

    // =========================
    // CONFIG SERVICE
    // =========================
    await _service.configure(
      androidConfiguration: AndroidConfiguration(
        onStart: onStart,
        isForegroundMode: true,
        autoStart: BackgroundConfig.autoStart,
        notificationChannelId: BackgroundConfig.channelId,
        initialNotificationTitle: BackgroundConfig.notificationTitle,
        initialNotificationContent: BackgroundConfig.notificationContent,
        foregroundServiceNotificationId:
        BackgroundConfig.foregroundNotificationId,
      ),
      iosConfiguration: IosConfiguration(
        autoStart: BackgroundConfig.autoStart,
        onForeground: onStart,
        onBackground: _iosBackground,
      ),
    );

    _configured = true;

    debugPrint("✅ Background Service Configured");
  }

  /// =========================
  /// START SERVICE
  /// =========================
  Future<void> start() async {

    await _service.startService();
  }

  /// =========================
  /// STOP SERVICE
  /// =========================
  Future<void> stop() async {
    _service.invoke("stop");
  }

  /// =========================
  /// SEND DATA TO ISOLATE
  /// =========================
  void send(dynamic data) {
    _service.invoke("data", {"payload": data});
  }

  /// =========================
  /// UPDATE NOTIFICATION
  /// =========================

  Future<void> updateNotification({
    String? title,
    String? content,
  }) async {
    _service.invoke("update_notification", {
      "title": title,
      "content": content,
    });
  }

  /// =========================
  /// IOS BACKGROUND
  /// =========================
  @pragma('vm:entry-point')
  static Future<bool> _iosBackground(ServiceInstance service) async {
    return true;
  }
}