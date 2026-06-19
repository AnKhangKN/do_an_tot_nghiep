import 'package:flutter/material.dart';

class ChatListScreen extends StatelessWidget {
  const ChatListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final chats = [
      {
        "name": "Trung tâm cứu hộ",
        "message": "Admin đang theo dõi yêu cầu của bạn.",
        "time": "2 phút",
        "unread": 2,
        "isAdmin": true,
        "online": true,
      },
      {
        "name": "Nguyễn Văn Minh",
        "message": "Tôi đang bị mắc kẹt gần cầu Ninh Kiều.",
        "time": "5 phút",
        "unread": 1,
        "isAdmin": false,
        "online": true,
      },
      {
        "name": "Đội cứu hộ 02",
        "message": "Chúng tôi sẽ đến trong khoảng 10 phút.",
        "time": "12 phút",
        "unread": 0,
        "isAdmin": false,
        "online": true,
      },
      {
        "name": "Lê Thị Hoa",
        "message": "Cảm ơn đội cứu hộ đã hỗ trợ.",
        "time": "1 giờ",
        "unread": 0,
        "isAdmin": false,
        "online": false,
      },
      {
        "name": "Phòng điều phối",
        "message": "Có cảnh báo thời tiết mới trong khu vực.",
        "time": "Hôm qua",
        "unread": 0,
        "isAdmin": true,
        "online": false,
      },
    ];

    return Scaffold(
      backgroundColor: const Color(0xFFF4F7FC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        surfaceTintColor: Colors.white,
        centerTitle: true,
        title: const Text(
          "Trò chuyện",
          style: TextStyle(
            color: Color(0xFF1B1E28),
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          IconButton(
            onPressed: () {},
            icon: const Icon(
              Icons.support_agent_rounded,
              color: Color(0xFF1565C0),
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Header Card
            Container(
              margin: const EdgeInsets.all(16),
              padding: const EdgeInsets.all(18),
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
                    color: Colors.blue.withOpacity(0.2),
                    blurRadius: 18,
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
                      Icons.chat_bubble_rounded,
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
                          "Liên lạc cứu hộ",
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          "Trao đổi trực tiếp với đội cứu hộ và admin hỗ trợ khẩn cấp.",
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

            // Search
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.04),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: const TextField(
                  decoration: InputDecoration(
                    icon: Icon(Icons.search_rounded),
                    border: InputBorder.none,
                    hintText: "Tìm kiếm cuộc trò chuyện...",
                  ),
                ),
              ),
            ),

            const SizedBox(height: 16),

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
                    isAdmin: chat["isAdmin"] as bool,
                    online: chat["online"] as bool,
                  );
                },
              ),
            ),
          ],
        ),
      ),

      // Floating button contact admin
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: const Color(0xFFD32F2F),
        onPressed: () {},
        icon: const Icon(Icons.support_agent_rounded),
        label: const Text(
          "Liên hệ Admin",
          style: TextStyle(fontWeight: FontWeight.bold),
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
  final bool isAdmin;
  final bool online;

  const _ChatTile({
    required this.name,
    required this.message,
    required this.time,
    required this.unread,
    required this.isAdmin,
    required this.online,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        children: [
          Stack(
            children: [
              CircleAvatar(
                radius: 30,
                backgroundColor: isAdmin
                    ? const Color(0xFF1565C0).withOpacity(0.15)
                    : const Color(0xFFD32F2F).withOpacity(0.12),
                child: Icon(
                  isAdmin
                      ? Icons.support_agent_rounded
                      : Icons.person_rounded,
                  size: 32,
                  color: isAdmin
                      ? const Color(0xFF1565C0)
                      : const Color(0xFFD32F2F),
                ),
              ),

              // Online dot
              if (online)
                Positioned(
                  bottom: 2,
                  right: 2,
                  child: Container(
                    width: 14,
                    height: 14,
                    decoration: BoxDecoration(
                      color: Colors.green,
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: Colors.white,
                        width: 2,
                      ),
                    ),
                  ),
                ),
            ],
          ),

          const SizedBox(width: 14),

          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Row(
                        children: [
                          Flexible(
                            child: Text(
                              name,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),

                          if (isAdmin) ...[
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(0xFF1565C0)
                                    .withOpacity(0.1),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: const Text(
                                "ADMIN",
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF1565C0),
                                ),
                              ),
                            ),
                          ]
                        ],
                      ),
                    ),

                    Text(
                      time,
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 8),

                Row(
                  children: [
                    Expanded(
                      child: Text(
                        message,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey.shade700,
                        ),
                      ),
                    ),

                    if (unread > 0) ...[
                      const SizedBox(width: 10),
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: const BoxDecoration(
                          color: Color(0xFFD32F2F),
                          shape: BoxShape.circle,
                        ),
                        child: Text(
                          unread.toString(),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ]
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