import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/constants/color_constants.dart';
import '../../../../core/utils/app_snackbar.dart';

class HelpCenterScreen extends StatefulWidget {
  const HelpCenterScreen({super.key});

  @override
  State<HelpCenterScreen> createState() => _HelpCenterScreenState();
}

class _HelpCenterScreenState extends State<HelpCenterScreen> {
  Future<void> _makePhoneCall(String phoneNumber) async {
    final Uri launchUri = Uri(
      scheme: 'tel',
      path: phoneNumber,
    );
    if (await canLaunchUrl(launchUri)) {
      await launchUrl(launchUri);
    } else {
      if (!mounted) return;
      AppSnackBar.show(
        context,
        'Không thể tự động gọi tới $phoneNumber. Vui lòng bấm máy thủ công.',
        type: AppSnackBarType.error,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ColorConstants.backgroundLight,
      appBar: AppBar(
        title: const Text(
          'Trung tâm trợ giúp',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
        backgroundColor: ColorConstants.surfaceWhite,
        foregroundColor: ColorConstants.textPrimary,
        elevation: 0.5,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          // Section: Gọi khẩn cấp quốc gia
          _buildSectionHeader('TỔNG ĐÀI CỨU HỘ KHẨN CẤP QUỐC GIA'),
          Row(
            children: [
              Expanded(
                child: _buildEmergencyCallCard(
                  number: '113',
                  title: 'Công an',
                  icon: Icons.local_police_outlined,
                  color: const Color(0xFF1E88E5),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildEmergencyCallCard(
                  number: '114',
                  title: 'Cứu hỏa',
                  icon: Icons.local_fire_department_outlined,
                  color: ColorConstants.redRescue,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildEmergencyCallCard(
                  number: '115',
                  title: 'Cấp cứu',
                  icon: Icons.medical_services_outlined,
                  color: ColorConstants.success,
                ),
              ),
            ],
          ),

          const SizedBox(height: 24),

          // Section: Câu hỏi thường gặp
          _buildSectionHeader('CÂU HỎI THƯỜNG GẶP (FAQ)'),
          Container(
            decoration: BoxDecoration(
              color: ColorConstants.surfaceWhite,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.03),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              children: const [
                _FaqItem(
                  question: 'Làm sao để gửi tín hiệu cứu hộ SOS?',
                  answer:
                      'Tại màn hình chính, nhấn giữ nút SOS trong 3 giây. Hệ thống sẽ tự động gửi vị trí GPS chính xác của bạn đến Đội cứu hộ gần nhất.',
                ),
                Divider(height: 1),
                _FaqItem(
                  question: 'Đội cứu hộ phản hồi trong bao lâu?',
                  answer:
                      'Ngay khi bạn phát tín hiệu SOS, các Cứu hộ viên trong bán kính lân cận sẽ nhận được thông báo còi báo động khẩn cấp và chấp nhận yêu cầu hỗ trợ tức thì.',
                ),
                Divider(height: 1),
                _FaqItem(
                  question: 'Làm thế nào để đăng ký làm Cứu hộ viên?',
                  answer:
                      'Bạn truy cập trang Cá nhân -> chọn "Đăng ký cứu hộ viên", điền thông tin chứng chỉ/kinh nghiệm cứu hộ và chờ Admin xét duyệt.',
                ),
                Divider(height: 1),
                _FaqItem(
                  question: 'Cách thêm điểm cảnh báo nguy hiểm hoặc tiện ích?',
                  answer:
                      'Trên màn hình Bản đồ, nhấn giữ vị trí cần báo cáo hoặc nhấn biểu tượng Thêm điểm. Nhập tên khu vực, loại nguy hiểm/tiện ích và nhấn Gửi.',
                ),
              ],
            ),
          ),

          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8),
      child: Text(
        title,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w800,
          color: ColorConstants.textSecondary,
          letterSpacing: 1.1,
        ),
      ),
    );
  }

  Widget _buildEmergencyCallCard({
    required String number,
    required String title,
    required IconData icon,
    required Color color,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: ColorConstants.surfaceWhite,
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
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () => _makePhoneCall(number),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(icon, color: color, size: 24),
                ),
                const SizedBox(height: 8),
                Text(
                  number,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: color,
                  ),
                ),
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: ColorConstants.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _FaqItem extends StatelessWidget {
  final String question;
  final String answer;

  const _FaqItem({required this.question, required this.answer});

  @override
  Widget build(BuildContext context) {
    return ExpansionTile(
      title: Text(
        question,
        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
      ),
      childrenPadding: const EdgeInsets.only(left: 16, right: 16, bottom: 16),
      expandedCrossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          answer,
          style: TextStyle(color: ColorConstants.textSecondary, fontSize: 13, height: 1.4),
        ),
      ],
    );
  }
}
