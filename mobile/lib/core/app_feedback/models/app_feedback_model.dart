/// Model báo cáo ứng dụng (app_feedbacks) trả về từ server
class AppFeedbackModel {
  final String feedbackId;
  final String userId;
  final String category;
  final String title;
  final String content;
  final String status;
  final String? adminNote;
  final DateTime createdAt;
  final DateTime? updatedAt;

  AppFeedbackModel({
    required this.feedbackId,
    required this.userId,
    required this.category,
    required this.title,
    required this.content,
    required this.status,
    this.adminNote,
    required this.createdAt,
    this.updatedAt,
  });

  factory AppFeedbackModel.fromJson(Map<String, dynamic> json) {
    return AppFeedbackModel(
      feedbackId: json['feedback_id']?.toString() ?? '',
      userId: json['user_id']?.toString() ?? '',
      category: json['category']?.toString() ?? 'OTHER',
      title: json['title']?.toString() ?? '',
      content: json['content']?.toString() ?? '',
      status: json['status']?.toString() ?? 'PENDING',
      adminNote: json['admin_note']?.toString(),
      createdAt: DateTime.tryParse(json['created_at']?.toString() ?? '') ??
          DateTime.now(),
      updatedAt: DateTime.tryParse(json['updated_at']?.toString() ?? ''),
    );
  }

  String get categoryLabel {
    switch (category) {
      case 'BUG':
        return 'Lỗi ứng dụng';
      case 'SUGGESTION':
        return 'Góp ý cải tiến';
      case 'CONTENT':
        return 'Nội dung không phù hợp';
      case 'OTHER':
      default:
        return 'Khác';
    }
  }

  String get statusLabel {
    switch (status) {
      case 'PENDING':
        return 'Chờ xử lý';
      case 'IN_PROGRESS':
        return 'Đang xử lý';
      case 'RESOLVED':
        return 'Đã xử lý';
      case 'REJECTED':
        return 'Từ chối';
      default:
        return status;
    }
  }
}
