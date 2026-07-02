import 'package:flutter/material.dart';

class HistoryScreen extends StatelessWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final histories = [
      {
        "title": "Cứu hộ thành công",
        "location": "Cầu Ninh Kiều, Cần Thơ",
        "date": "21/05/2026 • 14:20",
        "status": "success",
        "description":
        "Đội cứu hộ đã tiếp cận và hỗ trợ bạn an toàn.",
      },
      {
        "title": "Yêu cầu bị từ chối",
        "location": "Bình Thủy, Cần Thơ",
        "date": "18/05/2026 • 09:15",
        "status": "rejected",
        "description":
        "Yêu cầu không hợp lệ hoặc không đủ thông tin xác minh.",
      },
      {
        "title": "Cứu hộ không thành công",
        "location": "Phong Điền, Cần Thơ",
        "date": "15/05/2026 • 22:10",
        "status": "failed",
        "description":
        "Đội cứu hộ không thể tiếp cận vị trí do thời tiết xấu.",
      },
      {
        "title": "Cứu hộ thành công",
        "location": "Ninh Kiều, Cần Thơ",
        "date": "10/05/2026 • 17:45",
        "status": "success",
        "description":
        "Bạn đã được sơ tán đến khu vực an toàn.",
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
          "Lịch sử",
          style: TextStyle(
            color: Color(0xFF1B1E28),
            fontWeight: FontWeight.bold,
          ),
        ),
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
                      Icons.history_rounded,
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
                          "Lịch sử hỗ trợ",
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          "Theo dõi các yêu cầu cứu hộ đã được xử lý.",
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

            // Filter Tabs
            SizedBox(
              height: 42,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                children: [
                  _buildFilterChip("Tất cả", true),
                  _buildFilterChip("Thành công", false),
                  _buildFilterChip("Thất bại", false),
                  _buildFilterChip("Bị từ chối", false),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // History List
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: histories.length,
                itemBuilder: (context, index) {
                  final item = histories[index];

                  return _HistoryCard(
                    title: item["title"] as String,
                    location: item["location"] as String,
                    date: item["date"] as String,
                    description: item["description"] as String,
                    status: item["status"] as String,
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(String label, bool active) {
    return Container(
      margin: const EdgeInsets.only(right: 10),
      child: Chip(
        label: Text(
          label,
          style: TextStyle(
            color: active ? Colors.white : Colors.black87,
            fontWeight: FontWeight.w600,
          ),
        ),
        backgroundColor:
        active ? const Color(0xFF1565C0) : Colors.white,
        side: BorderSide(
          color: active
              ? const Color(0xFF1565C0)
              : Colors.grey.withOpacity(0.2),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 10),
      ),
    );
  }
}

class _HistoryCard extends StatelessWidget {
  final String title;
  final String location;
  final String date;
  final String description;
  final String status;

  const _HistoryCard({
    required this.title,
    required this.location,
    required this.date,
    required this.description,
    required this.status,
  });

  Color get statusColor {
    switch (status) {
      case "success":
        return Colors.green;
      case "failed":
        return Colors.orange;
      case "rejected":
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  IconData get statusIcon {
    switch (status) {
      case "success":
        return Icons.verified_rounded;
      case "failed":
        return Icons.warning_amber_rounded;
      case "rejected":
        return Icons.cancel_rounded;
      default:
        return Icons.history_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.12),
              borderRadius: BorderRadius.circular(18),
            ),
            child: Icon(
              statusIcon,
              color: statusColor,
              size: 30,
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
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 5,
                      ),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        status.toUpperCase(),
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: statusColor,
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 8),

                Row(
                  children: [
                    Icon(
                      Icons.location_on_rounded,
                      size: 16,
                      color: Colors.grey.shade600,
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        location,
                        style: TextStyle(
                          color: Colors.grey.shade700,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 6),

                Row(
                  children: [
                    Icon(
                      Icons.access_time_rounded,
                      size: 16,
                      color: Colors.grey.shade600,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      date,
                      style: TextStyle(
                        color: Colors.grey.shade700,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 12),

                Text(
                  description,
                  style: TextStyle(
                    color: Colors.grey.shade700,
                    height: 1.5,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}