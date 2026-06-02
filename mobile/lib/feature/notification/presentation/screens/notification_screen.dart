import 'package:flutter/material.dart';

class NotificationScreen extends StatelessWidget {
  const NotificationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final notifications = [
      {
        "title": "Yêu cầu cứu hộ mới",
        "message":
        "Có một nạn nhân đang cần hỗ trợ khẩn cấp tại Quận Ninh Kiều.",
        "time": "2 phút trước",
        "type": "emergency",
        "isRead": false,
      },
      {
        "title": "Đã cứu hộ thành công",
        "message":
        "Đội cứu hộ đã tiếp cận và hỗ trợ nạn nhân an toàn.",
        "time": "10 phút trước",
        "type": "success",
        "isRead": false,
      },
      {
        "title": "Cảnh báo thời tiết",
        "message":
        "Mưa lớn và triều cường có thể xảy ra trong khu vực.",
        "time": "1 giờ trước",
        "type": "warning",
        "isRead": true,
      },
      {
        "title": "Hệ thống cập nhật",
        "message":
        "Ứng dụng đã được nâng cấp để cải thiện tốc độ phản hồi.",
        "time": "Hôm nay",
        "type": "system",
        "isRead": true,
      },
      {
        "title": "Đội cứu hộ đang di chuyển",
        "message":
        "Đội cứu hộ đang đến vị trí của bạn. ETA khoảng 5 phút.",
        "time": "Hôm qua",
        "type": "moving",
        "isRead": true,
      },
    ];

    return Scaffold(
      backgroundColor: const Color(0xFFF3F6FB),
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        title: const Text(
          'Hộp thư',
          style: TextStyle(
            color: Color(0xFF1B1E28),
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Header info
            Container(
              margin: const EdgeInsets.all(16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [
                    Color(0xFFFD6D27),
                    Color(0xFFFF8C42),
                  ],
                ),
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: Colors.blue.withOpacity(0.25),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: const Icon(
                      Icons.notifications_active_rounded,
                      color: Colors.white,
                      size: 30,
                    ),
                  ),
                  const SizedBox(width: 16),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "Trung tâm cứu hộ",
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          "Theo dõi các thông báo khẩn cấp và cập nhật cứu hộ mới nhất.",
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  )
                ],
              ),
            ),

            // Notification list
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: notifications.length,
                itemBuilder: (context, index) {
                  final item = notifications[index];

                  return _NotificationCard(
                    title: item["title"] as String,
                    message: item["message"] as String,
                    time: item["time"] as String,
                    type: item["type"] as String,
                    isRead: item["isRead"] as bool,
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _NotificationCard extends StatelessWidget {
  final String title;
  final String message;
  final String time;
  final String type;
  final bool isRead;

  const _NotificationCard({
    required this.title,
    required this.message,
    required this.time,
    required this.type,
    required this.isRead,
  });

  Color get iconColor {
    switch (type) {
      case "emergency":
        return Colors.red;
      case "success":
        return Colors.green;
      case "warning":
        return Colors.orange;
      case "moving":
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }

  IconData get icon {
    switch (type) {
      case "emergency":
        return Icons.crisis_alert_rounded;
      case "success":
        return Icons.health_and_safety_rounded;
      case "warning":
        return Icons.warning_amber_rounded;
      case "moving":
        return Icons.local_shipping_rounded;
      default:
        return Icons.notifications_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: isRead
              ? Colors.grey.withOpacity(0.08)
              : iconColor.withOpacity(0.35),
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 14,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: iconColor.withOpacity(0.12),
              borderRadius: BorderRadius.circular(18),
            ),
            child: Icon(
              icon,
              color: iconColor,
              size: 28,
            ),
          ),

          const SizedBox(width: 14),

          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        title,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: isRead
                              ? Colors.black87
                              : const Color(0xFF111827),
                        ),
                      ),
                    ),
                    if (!isRead)
                      Container(
                        width: 10,
                        height: 10,
                        decoration: BoxDecoration(
                          color: iconColor,
                          shape: BoxShape.circle,
                        ),
                      ),
                  ],
                ),

                const SizedBox(height: 8),

                Text(
                  message,
                  style: TextStyle(
                    fontSize: 14,
                    height: 1.4,
                    color: Colors.grey.shade700,
                  ),
                ),

                const SizedBox(height: 12),

                Row(
                  children: [
                    Icon(
                      Icons.access_time_rounded,
                      size: 16,
                      color: Colors.grey.shade500,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      time,
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade600,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}