import 'package:flutter/material.dart';
import '../../../../core/constants/color_constants.dart';

class HistoryScreen extends StatelessWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final histories = [
      {
        "title": "Cứu hộ khẩn cấp",
        "location": "Cầu Ninh Kiều, Cần Thơ",
        "date": "21/05/2026 • 14:20",
        "status": "success",
        "description": "Đội cứu hộ đã tiếp cận và hỗ trợ bạn an toàn.",
      },
      {
        "title": "Yêu cầu y tế",
        "location": "Bình Thủy, Cần Thơ",
        "date": "18/05/2026 • 09:15",
        "status": "rejected",
        "description": "Yêu cầu không hợp lệ hoặc không đủ thông tin xác minh.",
      },
      {
        "title": "Tai nạn giao thông",
        "location": "Phong Điền, Cần Thơ",
        "date": "15/05/2026 • 22:10",
        "status": "failed",
        "description": "Đội cứu hộ không thể tiếp cận vị trí do thời tiết xấu.",
      },
      {
        "title": "Hỗ trợ di dời",
        "location": "Ninh Kiều, Cần Thơ",
        "date": "10/05/2026 • 17:45",
        "status": "success",
        "description": "Bạn đã được sơ tán đến khu vực an toàn.",
      },
    ];

    return Scaffold(
      backgroundColor: ColorConstants.backgroundLight,
      appBar: AppBar(
        backgroundColor: ColorConstants.surfaceWhite,
        elevation: 0,
        centerTitle: true,
        title: const Text(
          "LỊCH SỬ HỖ TRỢ",
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
            // Header Stats Card
            _buildStatsHeader(),

            // Filter Tabs
            SizedBox(
              height: 50,
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

            const SizedBox(height: 12),

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

  Widget _buildStatsHeader() {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: ColorConstants.redRescue,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: ColorConstants.redRescue.withOpacity(0.3),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: const Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _StatItem(label: "Tổng cộng", value: "24"),
          _VerticalDivider(),
          _StatItem(label: "Thành công", value: "22"),
          _VerticalDivider(),
          _StatItem(label: "Cảnh báo", value: "02"),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, bool active) {
    return Container(
      margin: const EdgeInsets.only(right: 8, bottom: 8, top: 8),
      child: FilterChip(
        label: Text(
          label,
          style: TextStyle(
            color: active ? Colors.white : ColorConstants.textSecondary,
            fontWeight: FontWeight.bold,
          ),
        ),
        selected: active,
        onSelected: (val) {},
        backgroundColor: ColorConstants.surfaceWhite,
        selectedColor: ColorConstants.redRescue,
        checkmarkColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(
            color: active ? ColorConstants.redRescue : Colors.transparent,
          ),
        ),
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String label;
  final String value;
  const _StatItem({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900),
        ),
        Text(
          label,
          style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w500),
        ),
      ],
    );
  }
}

class _VerticalDivider extends StatelessWidget {
  const _VerticalDivider();
  @override
  Widget build(BuildContext context) {
    return Container(height: 30, width: 1, color: Colors.white24);
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
      case "success": return ColorConstants.success;
      case "failed": return ColorConstants.orangeWarning;
      case "rejected": return ColorConstants.redRescue;
      default: return ColorConstants.textSecondary;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: ColorConstants.surfaceWhite,
        borderRadius: BorderRadius.circular(16),
        border: Border(left: BorderSide(color: statusColor, width: 6)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  title.toUpperCase(),
                  style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    status == "success" ? "HOÀN THÀNH" : status == "failed" ? "THẤT BẠI" : "BỊ TỪ CHỐI",
                    style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 10),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            _IconText(icon: Icons.location_on_outlined, text: location, color: ColorConstants.textPrimary),
            const SizedBox(height: 4),
            _IconText(icon: Icons.access_time, text: date, color: ColorConstants.textSecondary),
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 12),
              child: Divider(height: 1),
            ),
            Text(
              description,
              style: const TextStyle(color: ColorConstants.textSecondary, fontSize: 13, height: 1.4),
            ),
          ],
        ),
      ),
    );
  }
}

class _IconText extends StatelessWidget {
  final IconData icon;
  final String text;
  final Color color;
  const _IconText({required this.icon, required this.text, required this.color});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 16, color: ColorConstants.redRescue),
        const SizedBox(width: 8),
        Expanded(child: Text(text, style: TextStyle(color: color, fontSize: 13, fontWeight: FontWeight.w500))),
      ],
    );
  }
}
