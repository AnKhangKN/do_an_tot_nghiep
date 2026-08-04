import 'package:flutter/foundation.dart';
import '../models/app_feedback_model.dart';
import 'app_feedback_service.dart';

/// Kết quả phân trang lịch sử báo cáo
class AppFeedbackPage {
  final List<AppFeedbackModel> data;
  final int total;
  final int totalPages;

  const AppFeedbackPage({
    required this.data,
    required this.total,
    required this.totalPages,
  });
}

class AppFeedbackRepository {
  final AppFeedbackService appFeedbackService;

  AppFeedbackRepository(this.appFeedbackService);

  /// Gửi báo cáo ứng dụng mới
  Future<AppFeedbackModel> submitReport({
    required String category,
    required String title,
    required String content,
  }) async {
    try {
      final res = await appFeedbackService.createAppFeedback(
        category: category,
        title: title,
        content: content,
      );
      return AppFeedbackModel.fromJson(
        Map<String, dynamic>.from(res.data['data'] ?? {}),
      );
    } catch (e) {
      debugPrint('Lỗi gửi báo cáo ứng dụng: $e');
      rethrow;
    }
  }

  /// Lấy lịch sử báo cáo của user
  Future<AppFeedbackPage> getMyReports({int page = 1, int limit = 10}) async {
    try {
      final res = await appFeedbackService.getMyAppFeedbacks(
        page: page,
        limit: limit,
      );
      final Map<String, dynamic> body = Map<String, dynamic>.from(
        res.data['data'] ?? {},
      );
      final List<dynamic> dataList = body['data'] ?? [];
      final reports = dataList
          .map((e) => AppFeedbackModel.fromJson(e as Map<String, dynamic>))
          .toList();
      return AppFeedbackPage(
        data: reports,
        total: body['total'] ?? 0,
        totalPages: body['totalPages'] ?? 1,
      );
    } catch (e) {
      debugPrint('Lỗi lấy lịch sử báo cáo ứng dụng: $e');
      rethrow;
    }
  }
}
