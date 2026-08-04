import 'package:dio/dio.dart';
import '../../constants/api_endpoints.dart';

/// Service gọi trực tiếp API báo cáo ứng dụng (trả về Response thô)
class AppFeedbackService {
  final Dio dio;

  AppFeedbackService(this.dio);

  /// Gửi báo cáo ứng dụng mới
  Future<Response> createAppFeedback({
    required String category,
    required String title,
    required String content,
  }) async {
    return await dio.post(
      ApiEndpoints.appFeedbacks,
      data: {
        'category': category,
        'title': title,
        'content': content,
      },
    );
  }

  /// Lấy lịch sử báo cáo của user (phân trang)
  Future<Response> getMyAppFeedbacks({int page = 1, int limit = 10}) async {
    return await dio.get(
      ApiEndpoints.myAppFeedbacks,
      queryParameters: {'page': page, 'limit': limit},
    );
  }
}
