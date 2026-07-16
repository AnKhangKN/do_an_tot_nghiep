import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:mobile/core/di/di.dart';
import 'package:mobile/core/storage/offline_queue_service.dart';
import '../core/background/background_service.dart';

class AppBootstrap {
  static Future<void> init() async {
    // load env
    await dotenv.load(fileName: ".env.development");

    // Khởi tạo Database local Hive cho offline queue
    await OfflineQueueService().init();

    // init DI
    await initDI();

    // Xin quyền và khởi tạo cấu hình local notification/background service khi vào app
    try {
      final backgroundService = getIt<BackgroundService>();
      await backgroundService.requestNotificationPermission();
      await backgroundService.initialize();
    } catch (e) {
      // Bắt lỗi đề phòng lỗi DI hoặc FlutterLocalNotificationsPlugin chưa sẵn sàng
      print("⚠️ Lỗi khởi tạo background service: $e");
    }

    // Bật map catching
  }
}