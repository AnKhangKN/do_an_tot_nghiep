import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:mobile/core/di/di.dart';
import 'package:mobile/core/theme/theme_controller.dart';
import 'package:mobile/core/storage/offline_queue_service.dart';
import '../core/background/background_service.dart';
import '../firebase_options.dart';

class AppBootstrap {
  static Future<void> init() async {
    // 1. Cấu hình Bắt lỗi toàn cục (Flutter Framework & Async Exceptions)
    _setupGlobalErrorHandling();

    // 2. Load biến môi trường .env (.env.production kèm fallback .env)
    try {
      await dotenv.load(fileName: ".env.production");
    } catch (e) {
      debugPrint("⚠️ [Bootstrap] Không thể tải .env.production: $e");
      try {
        await dotenv.load(fileName: ".env");
      } catch (err) {
        debugPrint("⚠️ [Bootstrap] Không tìm thấy file .env: $err");
      }
    }

    // 3. Khởi tạo Database local Hive cho offline queue
    try {
      await OfflineQueueService().init();
    } catch (e) {
      debugPrint("⚠️ [Bootstrap] Lỗi khởi tạo OfflineQueueService (Hive): $e");
    }

    // 4. Khởi tạo Firebase
    try {
      await Firebase.initializeApp(
        options: DefaultFirebaseOptions.currentPlatform,
      );
    } catch (e) {
      debugPrint("⚠️ [Bootstrap] Lỗi khởi tạo Firebase: $e");
    }

    // 5. Khởi tạo Dependency Injection (getIt)
    try {
      await initDI();
    } catch (e) {
      debugPrint("🚨 [Bootstrap] Lỗi khởi tạo Dependency Injection (initDI): $e");
    }

    // 5.1 Nạp chế độ sáng/tối đã lưu trước khi render màn hình đầu tiên
    try {
      await getIt<ThemeController>().load();
    } catch (e) {
      debugPrint("⚠️ [Bootstrap] Lỗi nạp chế độ giao diện: $e");
    }

    // 6. Xin quyền và khởi tạo cấu hình local notification / background service
    try {
      final backgroundService = getIt<BackgroundService>();
      await backgroundService.requestNotificationPermission();
      await backgroundService.initialize();
    } catch (e) {
      debugPrint("⚠️ [Bootstrap] Lỗi khởi tạo background service: $e");
    }
  }

  /// Cấu hình theo dõi và ghi log lỗi toàn cục cho ứng dụng
  static void _setupGlobalErrorHandling() {
    // Bắt lỗi hệ thống UI rendering từ Flutter Framework
    FlutterError.onError = (FlutterErrorDetails details) {
      FlutterError.presentError(details);
      debugPrint("🚨 [Flutter Framework Error]: ${details.exceptionAsString()}");
      if (details.stack != null) {
        debugPrint(details.stack.toString());
      }
    };

    // Bắt các lỗi bất đồng bộ (Async Root Zone) chưa được xử lý
    PlatformDispatcher.instance.onError = (error, stack) {
      debugPrint("🚨 [Uncaught Async Error]: $error");
      debugPrint(stack.toString());
      return true; // Ngăn ứng dụng bị văng/crash bất ngờ
    };
  }
}