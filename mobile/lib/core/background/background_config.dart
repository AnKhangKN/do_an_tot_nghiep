class BackgroundConfig {
  // =========================
  // LOCATION
  // =========================
  static const int locationIntervalSeconds = 2;
  static const double minDistanceMeters = 2;

  // =========================
  // SOCKET
  // =========================
  static const int heartbeatSeconds = 10;
  static const bool enableSocketPush = true;

  // =========================
  // SERVICE
  // =========================
  static const bool autoStart = true;
  static const int foregroundNotificationId = 1001;

  // =========================
  // NOTIFICATION
  // =========================
  static const String channelId = "rescue_service_channel";
  static const String channelName = "Cứu hộ nhanh";
  static const String channelDesc = "Background SOS tracking service";

  static const String notificationTitle = "Rescue Service";
  static const String notificationContent =
      "Ứng dụng cứu hộ đang hoạt động...";

// =========================
// NOTIFICATION - OTHER
// =========================
  static const String notificationContentGoOnline =
      "Đã sẵn sàng nhận cứu hộ...";

  static const String notificationContentBusy =
      "Đang thực hiện cứu hộ...";

  static const String notificationContentOffline =
      "Đang tạm ngưng nhận cứu hộ...";
}