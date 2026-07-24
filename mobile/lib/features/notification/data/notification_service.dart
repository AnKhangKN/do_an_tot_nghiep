import 'package:dio/dio.dart';

class MobileNotificationService {
  final Dio dio;

  MobileNotificationService(this.dio);

  /// Lấy danh sách thông báo của tài khoản hiện tại từ Server API
  Future<Response> getMyNotifications() async {
    return await dio.get('/api/notifications');
  }

  /// Đánh dấu đã đọc tất cả thông báo
  Future<Response> markAllAsRead() async {
    return await dio.put('/api/notifications/read-all');
  }
}
