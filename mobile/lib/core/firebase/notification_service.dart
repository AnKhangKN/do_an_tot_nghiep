import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:get_it/get_it.dart';
import 'package:mobile/features/auth/data/auth_repository.dart';

// Kênh thông báo Android
const AndroidNotificationChannel _channel = AndroidNotificationChannel(
  'high_importance_channel',
  'Thông báo quan trọng',
  description: 'Kênh hiển thị thông báo đẩy từ Firebase',
  importance: Importance.max,
);

final FlutterLocalNotificationsPlugin _localNotificationsPlugin =
    FlutterLocalNotificationsPlugin();

// Handler background — phải là top-level function
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  debugPrint("🟢 [FCM][Background] Received: ${message.messageId}");
  await _showLocalNotification(message);
}

Future<void> _showLocalNotification(RemoteMessage message) async {
  final notification = message.notification;
  final title = notification?.title ?? message.data["title"]?.toString() ?? "Thông báo";
  final body = notification?.body ?? message.data["body"]?.toString() ?? "";

  // flutter_local_notifications v22: tất cả là named parameters
  await _localNotificationsPlugin.show(
    id: notification?.hashCode ?? message.hashCode,
    title: title,
    body: body,
    notificationDetails: NotificationDetails(
      android: AndroidNotificationDetails(
        _channel.id,
        _channel.name,
        channelDescription: _channel.description,
        importance: Importance.max,
        priority: Priority.high,
        icon: '@mipmap/ic_launcher',
      ),
    ),
    payload: message.data.isNotEmpty ? message.data.toString() : null,
  );
}

class NotificationService {
  bool _isInitialized = false;

  Future<void> initialize() async {
    try {
      // Nếu đã khởi tạo thì chỉ refresh token, không đăng ký listener lại
      if (_isInitialized) {
        final token = await FirebaseMessaging.instance.getToken();
        if (token != null) {
          await _sendTokenToServer(token);
        }
        return;
      }

      // 1. Khởi tạo Flutter Local Notifications
      await _initLocalNotifications();

      // 2. Xin quyền
      await FirebaseMessaging.instance.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );

      // 3. Đăng ký background handler (phải gọi trước khi lắng nghe foreground)
      FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

      // 4. Lắng nghe message khi app đang mở (Foreground)
      //    Chỉ đăng ký 1 lần duy nhất nhờ flag _isInitialized
      FirebaseMessaging.onMessage.listen((RemoteMessage message) async {
        debugPrint("🟢 [FCM][Foreground] Received: ${message.messageId}");
        await _showLocalNotification(message);
      });

      // 5. Lắng nghe khi user bấm vào notification để mở app
      FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
        debugPrint("🟢 [FCM] Notification tapped (app resumed): ${message.messageId}");
      });

      // 6. Kiểm tra notification khởi động app (app bị terminated)
      final initialMessage = await FirebaseMessaging.instance.getInitialMessage();
      if (initialMessage != null) {
        debugPrint("🟢 [FCM] App launched from notification: ${initialMessage.messageId}");
      }

      // 7. Lấy FCM token và gửi lên Server
      final token = await FirebaseMessaging.instance.getToken();
      if (token != null) {
        debugPrint("🟢 FCM Token: $token");
        await _sendTokenToServer(token);
      }

      // 8. Lắng nghe token refresh
      FirebaseMessaging.instance.onTokenRefresh.listen((newToken) async {
        debugPrint("🟢 FCM Token refreshed: $newToken");
        await _sendTokenToServer(newToken);
      });

      _isInitialized = true;
    } catch (e) {
      debugPrint("🚨 Lỗi khởi tạo NotificationService: $e");
    }
  }

  Future<void> _initLocalNotifications() async {
    const androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosInit = DarwinInitializationSettings();

    const initSettings = InitializationSettings(
      android: androidInit,
      iOS: iosInit,
    );

    // flutter_local_notifications v22: initialize() yêu cầu named param 'settings:'
    await _localNotificationsPlugin.initialize(settings: initSettings);

    // Tạo kênh Android (bắt buộc với Android 8+)
    await _localNotificationsPlugin
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(_channel);
  }

  Future<void> _sendTokenToServer(String token) async {
    try {
      final authRepository = GetIt.instance<AuthRepository>();
      final hasToken = await authRepository.getValidAccessToken();
      if (hasToken != null) {
        await authRepository.registerDeviceToken(token);
      }
    } catch (e) {
      debugPrint("🚨 Lỗi gửi FCM token lên Server: $e");
    }
  }

  /// Xóa dấu vết FCM của tài khoản cũ khi đăng xuất:
  /// 1. Hủy đăng ký token cũ trên server (xóa mapping token -> tài khoản cũ).
  /// 2. Thu hồi token cũ trên Firebase để lần `getToken()` sau được cấp token FCM MỚI.
  /// Cả 2 bước đều best-effort (lỗi thì bỏ qua, không chặn logout).
  Future<void> unregisterAndRotateToken() async {
    try {
      final oldToken = await FirebaseMessaging.instance.getToken();
      if (oldToken != null && oldToken.isNotEmpty) {
        await GetIt.instance<AuthRepository>().unregisterDeviceToken(oldToken);
      }
    } catch (e) {
      debugPrint("🚨 Lỗi hủy đăng ký FCM token cũ trên server: $e");
    }

    try {
      await FirebaseMessaging.instance.deleteToken();
      debugPrint("🟢 Đã thu hồi FCM token cũ. Lần đăng nhập sau sẽ được cấp token FCM mới.");
    } catch (e) {
      debugPrint("🚨 Lỗi thu hồi FCM token cũ: $e");
    }
  }
}
