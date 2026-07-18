import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:get_it/get_it.dart';
import 'package:mobile/features/auth/data/auth_repository.dart';

class NotificationService {
  bool _isInitialized = false;

  Future<void> initialize() async {
    try {
      if (_isInitialized) {
        // Nếu đã khởi tạo rồi, lấy token hiện tại và gửi lại lên server
        final token = await FirebaseMessaging.instance.getToken();
        if (token != null) {
          await _sendTokenToServer(token);
        }
        return;
      }

      await FirebaseMessaging.instance.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );

      final token = await FirebaseMessaging.instance.getToken();
      if (token != null) {
        debugPrint("🟢 FCM Token: $token");
        await _sendTokenToServer(token);
      }

      // Lắng nghe cập nhật token động từ Firebase
      FirebaseMessaging.instance.onTokenRefresh.listen((newToken) async {
        debugPrint("🟢 FCM Token refreshed: $newToken");
        await _sendTokenToServer(newToken);
      });

      _isInitialized = true;
    } catch (e) {
      debugPrint("🚨 Lỗi khởi tạo NotificationService: $e");
    }
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
}