import 'package:flutter/material.dart';
import '../../../../core/constants/color_constants.dart';
import '../widgets/notification_card.dart';

class NotificationScreen extends StatelessWidget {
  const NotificationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final notifications = [
      {
        "title": "Yêu cầu cứu hộ khẩn cấp!",
        "message": "Có nạn nhân đang cần hỗ trợ tại khu vực Cầu Ninh Kiều.",
        "time": "2 phút trước",
        "type": "emergency",
        "isRead": false,
      },
      {
        "title": "Đội cứu hộ đang di chuyển",
        "message": "Cứu hộ viên Nguyễn Văn Minh đang trên đường đến vị trí của bạn.",
        "time": "10 phút trước",
        "type": "moving",
        "isRead": false,
      },
      {
        "title": "Cảnh báo thiên tai diện rộng",
        "message": "Dự báo triều cường vượt mức báo động 3 trong 24 giờ tới.",
        "time": "1 giờ trước",
        "type": "warning",
        "isRead": true,
      },
      {
        "title": "Xác nhận hỗ trợ thành công",
        "message": "Yêu cầu số #SOS-102 đã được xử lý hoàn tất.",
        "time": "Hôm nay",
        "type": "success",
        "isRead": true,
      },
    ];

    return Scaffold(
      backgroundColor: ColorConstants.backgroundLight,
      appBar: AppBar(
        backgroundColor: ColorConstants.surfaceWhite,
        elevation: 0,
        centerTitle: true,
        title: const Text(
          "THÔNG BÁO HỆ THỐNG",
          style: TextStyle(
            color: ColorConstants.redRescue,
            fontWeight: FontWeight.w900,
            letterSpacing: 1.1,
          ),
        ),
        actions: [
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.done_all, color: ColorConstants.redRescue),
            tooltip: "Đánh dấu đã đọc",
          )
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Quick Filter or Summary
            _buildSummaryRow(),

            const SizedBox(height: 8),

            // Notification list
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: notifications.length,
                itemBuilder: (context, index) {
                  final item = notifications[index];
                  return NotificationCard(
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

  Widget _buildSummaryRow() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Text(
            "Gần đây",
            style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: ColorConstants.redRescue.withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Text(
              "2 Thông báo mới",
              style: TextStyle(color: ColorConstants.redRescue, fontSize: 12, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }
}
