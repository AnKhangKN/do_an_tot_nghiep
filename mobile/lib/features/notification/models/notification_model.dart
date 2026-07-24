class AppNotificationModel {
  final String notificationId;
  final String title;
  final String content;
  final bool isRead;
  final String type;
  final DateTime createdAt;

  AppNotificationModel({
    required this.notificationId,
    required this.title,
    required this.content,
    required this.isRead,
    required this.type,
    required this.createdAt,
  });

  factory AppNotificationModel.fromJson(Map<String, dynamic> json) {
    return AppNotificationModel(
      notificationId: json['notification_id'] ?? json['id'] ?? '',
      title: json['title'] ?? 'Thông báo',
      content: json['content'] ?? json['body'] ?? '',
      isRead: json['is_read'] ?? json['isRead'] ?? false,
      type: json['type'] ?? 'SYSTEM',
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
    );
  }
}
