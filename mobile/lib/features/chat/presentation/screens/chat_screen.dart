import 'package:flutter/material.dart';
import '../../../../core/constants/color_constants.dart';

class ChatScreen extends StatelessWidget {
  const ChatScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final chats = [
      {
        "name": "Trung tâm điều phối",
        "message": "Admin đang theo dõi yêu cầu của bạn.",
        "time": "2 phút",
        "unread": 2,
        "isEmergency": true,
        "online": true,
      },
      {
        "name": "Nguyễn Văn Minh (Cứu hộ viên)",
        "message": "Tôi đang đến gần vị trí của bạn.",
        "time": "5 phút",
        "unread": 1,
        "isEmergency": false,
        "online": true,
      },
      {
        "name": "Đội cứu hộ số 02",
        "message": "Chúng tôi sẽ đến trong 10 phút nữa.",
        "time": "12 phút",
        "unread": 0,
        "isEmergency": false,
        "online": true,
      },
      {
        "name": "Phòng chỉ huy",
        "message": "Cập nhật bản đồ khu vực nguy hiểm.",
        "time": "Hôm qua",
        "unread": 0,
        "isEmergency": true,
        "online": false,
      },
    ];

    return Scaffold(
      backgroundColor: ColorConstants.backgroundLight,
      appBar: AppBar(
        backgroundColor: ColorConstants.surfaceWhite,
        elevation: 0,
        centerTitle: true,
        title: const Text(
          "TIN NHẮN HỖ TRỢ",
          style: TextStyle(
            color: ColorConstants.redRescue,
            fontWeight: FontWeight.w900,
            letterSpacing: 1.1,
          ),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Search Bar
            _buildSearchBar(),

            const SizedBox(height: 8),

            // Chat list
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: chats.length,
                itemBuilder: (context, index) {
                  final chat = chats[index];
                  return _ChatTile(
                    name: chat["name"] as String,
                    message: chat["message"] as String,
                    time: chat["time"] as String,
                    unread: chat["unread"] as int,
                    isEmergency: chat["isEmergency"] as bool,
                    online: chat["online"] as bool,
                  );
                },
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: ColorConstants.redRescue,
        onPressed: () {},
        icon: const Icon(Icons.emergency_share, color: Colors.white),
        label: const Text(
          "HỖ TRỢ KHẨN CẤP",
          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
        ),
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Container(
        decoration: BoxDecoration(
          color: ColorConstants.surfaceWhite,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: const TextField(
          decoration: InputDecoration(
            hintText: "Tìm kiếm cuộc hội thoại...",
            prefixIcon: Icon(Icons.search, color: ColorConstants.redRescue),
            border: InputBorder.none,
            contentPadding: EdgeInsets.symmetric(vertical: 15),
          ),
        ),
      ),
    );
  }
}

class _ChatTile extends StatelessWidget {
  final String name;
  final String message;
  final String time;
  final int unread;
  final bool isEmergency;
  final bool online;

  const _ChatTile({
    required this.name,
    required this.message,
    required this.time,
    required this.unread,
    required this.isEmergency,
    required this.online,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: ColorConstants.surfaceWhite, // Chuyển màu nền lên Material
        borderRadius: BorderRadius.circular(16),
        clipBehavior: Clip.antiAlias,
        child: ListTile(          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          leading: Stack(
            children: [
              CircleAvatar(
                radius: 28,
                backgroundColor: isEmergency ? ColorConstants.redRescue.withOpacity(0.1) : ColorConstants.backgroundLight,
                child: Icon(
                  isEmergency ? Icons.admin_panel_settings : Icons.person,
                  color: isEmergency ? ColorConstants.redRescue : ColorConstants.textSecondary,
                  size: 30,
                ),
              ),
              if (online)
                Positioned(
                  right: 0,
                  bottom: 0,
                  child: Container(
                    width: 14,
                    height: 14,
                    decoration: BoxDecoration(
                      color: ColorConstants.success,
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 2),
                    ),
                  ),
                ),
            ],
          ),
          title: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
                ),
              ),
              Text(time, style: const TextStyle(color: ColorConstants.textSecondary, fontSize: 12)),
            ],
          ),
          subtitle: Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    message,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: unread > 0 ? ColorConstants.textPrimary : ColorConstants.textSecondary,
                      fontWeight: unread > 0 ? FontWeight.bold : FontWeight.normal,
                    ),
                  ),
                ),
                if (unread > 0)
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: const BoxDecoration(color: ColorConstants.redRescue, shape: BoxShape.circle),
                    child: Text(
                      unread.toString(),
                      style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ),
              ],
            ),
          ),
          onTap: () {},
        ),
      ),
    );
  }
}
