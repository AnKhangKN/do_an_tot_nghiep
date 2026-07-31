import 'package:flutter/material.dart';
import '../../../../core/constants/color_constants.dart';

class AppInfoScreen extends StatelessWidget {
  const AppInfoScreen({super.key});

  void _showTermsDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _buildTextModal(
        context,
        title: 'Điều khoản sử dụng',
        content: '''
1. Quyền và Trách nhiệm Người dùng:
- Người dùng chịu trách nhiệm về tính chính xác của các tín hiệu SOS phát ra.
- Nghiêm cấm hành vi phát tín hiệu SOS giả hoặc tạo điểm cảnh báo giả làm sai lệch dữ liệu cứu hộ.

2. Quyền riêng tư & Vị trí:
- Ứng dụng thu thập dữ liệu vị trí GPS khi bạn kích hoạt tín hiệu SOS hoặc chế độ cứu hộ ngầm nhằm mục đích chỉ đường cho Đội cứu hộ.
- Dữ liệu vị trí được bảo mật tuyệt đối và chỉ chia sẻ cho Cứu hộ viên trong thời gian xử lý sự cố.

3. Giới hạn trách nhiệm:
- Hệ thống hỗ trợ tối đa việc kết nối cứu hộ thời gian thực nhưng không thay thế hoàn toàn cho các cơ quan chức năng nhà nước (113, 114, 115).
        ''',
      ),
    );
  }

  void _showPrivacyDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _buildTextModal(
        context,
        title: 'Chính sách bảo mật',
        content: '''
1. Dữ liệu chúng tôi thu thập:
- Thông tin tài khoản: Họ tên, Số điện thoại, Email và Ảnh đại diện.
- Dữ liệu vị trí GPS thời gian thực khi sử dụng tính năng cứu hộ hoặc báo cáo cảnh báo.

2. Mục đích sử dụng dữ liệu:
- Tìm kiếm và kết nối Nạn nhân với Cứu hộ viên gần nhất.
- Phát cảnh báo vùng nguy hiểm cho người dùng trong bán kính nguy cơ.

3. Cam kết bảo mật:
- Mọi thông tin cá nhân đều được mã hóa và bảo vệ theo tiêu chuẩn an toàn thông tin. Chúng tôi cam kết không bán hoặc chia sẻ dữ liệu cho bên thứ ba vì mục đích thương mại.
        ''',
      ),
    );
  }

  Widget _buildTextModal(BuildContext context, {required String title, required String content}) {
    return Container(
      decoration: BoxDecoration(
        color: ColorConstants.surfaceWhite,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            title,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: ColorConstants.textPrimary,
            ),
          ),
          const Divider(height: 24),
          SingleChildScrollView(
            child: Text(
              content,
              style: TextStyle(
                fontSize: 14,
                color: ColorConstants.textSecondary,
                height: 1.5,
              ),
            ),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: ColorConstants.redRescue,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () => Navigator.pop(context),
              child: const Text('ĐÃ HỂU', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ColorConstants.backgroundLight,
      appBar: AppBar(
        title: const Text(
          'Thông tin ứng dụng',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
        backgroundColor: ColorConstants.surfaceWhite,
        foregroundColor: ColorConstants.textPrimary,
        elevation: 0.5,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            const SizedBox(height: 16),
            // Logo & App Title
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: ColorConstants.redRescue.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.sos_rounded,
                color: ColorConstants.redRescue,
                size: 64,
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'HỆ THỐNG CỨU HỘ KHẨN CẤP THỜI GIAN THỰC',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: ColorConstants.textPrimary,
                letterSpacing: 0.5,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Phiên bản 1.0.0 (Build 100)',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: ColorConstants.textSecondary,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Nền tảng cứu hộ khẩn cấp thời gian thực kết nối Nạn nhân và Đội ngũ Cứu hộ viên hỗ trợ nhanh chóng thông qua GPS và Socket thời gian thực.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                color: ColorConstants.textSecondary,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 32),

            // Card Menu
            Container(
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
                color: ColorConstants.surfaceWhite,
                borderRadius: BorderRadius.circular(16),
                clipBehavior: Clip.antiAlias,
                child: Column(
                  children: [
                    ListTile(
                      leading: const Icon(Icons.gavel_outlined, color: ColorConstants.redRescue),
                      title: const Text('Điều khoản sử dụng', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                      trailing: const Icon(Icons.chevron_right, size: 20),
                      onTap: () => _showTermsDialog(context),
                    ),
                    const Divider(height: 1),
                    ListTile(
                      leading: const Icon(Icons.privacy_tip_outlined, color: ColorConstants.redRescue),
                      title: const Text('Chính sách bảo mật', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                      trailing: const Icon(Icons.chevron_right, size: 20),
                      onTap: () => _showPrivacyDialog(context),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 48),

            // Footer
            Text(
              'ĐỒ ÁN TỐT NGHIỆP BẢO VỆ THÀNH CÔNG',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: ColorConstants.textSecondary,
                letterSpacing: 0.8,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '© 2026 Rescuing Real-Time System. All rights reserved.',
              style: TextStyle(
                fontSize: 11,
                color: ColorConstants.textSecondary.withOpacity(0.7),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
