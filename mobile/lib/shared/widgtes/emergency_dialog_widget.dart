import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/constants/color_constants.dart';

class EmergencyContactItem {
  final String title;
  final String phoneNumber;
  final String description;
  final IconData icon;
  final Color color;

  const EmergencyContactItem({
    required this.title,
    required this.phoneNumber,
    required this.description,
    required this.icon,
    required this.color,
  });
}

class EmergencyDialogWidget extends StatelessWidget {
  const EmergencyDialogWidget({super.key});

  static const List<EmergencyContactItem> _contacts = [
    EmergencyContactItem(
      title: '115 - Cấp cứu Y tế',
      phoneNumber: '115',
      description: 'Gọi cấp cứu y tế khẩn cấp, xe thương bệnh nhân',
      icon: Icons.medical_services_rounded,
      color: ColorConstants.danger,
    ),
    EmergencyContactItem(
      title: '114 - Cứu hộ & Cứu hỏa',
      phoneNumber: '114',
      description: 'Phòng cháy chữa cháy, cứu hộ cứu nạn thiên tai',
      icon: Icons.local_fire_department_rounded,
      color: ColorConstants.dangerMedium,
    ),
    EmergencyContactItem(
      title: '113 - Cảnh sát phản ứng nhanh',
      phoneNumber: '113',
      description: 'Cảnh sát trật tự, sự cố an ninh trật tự giao thông',
      icon: Icons.local_police_rounded,
      color: ColorConstants.primary,
    ),
    EmergencyContactItem(
      title: '112 - Tìm kiếm Cứu nạn Quốc gia',
      phoneNumber: '112',
      description: 'Yêu cầu trợ giúp tìm kiếm cứu nạn trên toàn quốc',
      icon: Icons.sos_rounded,
      color: ColorConstants.dangerHigh,
    ),
  ];

  static void show(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const EmergencyDialogWidget(),
    );
  }

  Future<void> _makeCall(String phoneNumber) async {
    final Uri uri = Uri.parse('tel:$phoneNumber');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.70,
      ),
      decoration: const BoxDecoration(
        color: ColorConstants.surfaceWhite,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(28),
          topRight: Radius.circular(28),
        ),
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Container(
              padding: const EdgeInsets.fromLTRB(20, 18, 12, 16),
              decoration: const BoxDecoration(
                border: Border(
                  bottom: BorderSide(color: ColorConstants.divider, width: 1),
                ),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: ColorConstants.dangerHighLight,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Icon(
                      Icons.phone_in_talk_rounded,
                      color: ColorConstants.danger,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 14),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Cuộc gọi Khẩn cấp',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: ColorConstants.slateDark,
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Danh sách số điện thoại hỗ trợ 24/7',
                          style: TextStyle(
                            fontSize: 12,
                            color: ColorConstants.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close, color: ColorConstants.textMuted),
                    tooltip: 'Đóng',
                  ),
                ],
              ),
            ),

            // Scrollable List
            Expanded(
              child: Scrollbar(
                child: ListView.separated(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  itemCount: _contacts.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final item = _contacts[index];
                    return Container(
                      decoration: BoxDecoration(
                        color: ColorConstants.bgCanvas,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: ColorConstants.border,
                          width: 1,
                        ),
                      ),
                      child: ListTile(
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 6,
                        ),
                        leading: Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: item.color.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(
                            item.icon,
                            color: item.color,
                            size: 22,
                          ),
                        ),
                        title: Text(
                          item.title,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: ColorConstants.textPrimary,
                          ),
                        ),
                        subtitle: Padding(
                          padding: const EdgeInsets.only(top: 4),
                          child: Text(
                            item.description,
                            style: const TextStyle(
                              fontSize: 11,
                              color: ColorConstants.textMuted,
                              height: 1.25,
                            ),
                          ),
                        ),
                        trailing: ElevatedButton.icon(
                          onPressed: () => _makeCall(item.phoneNumber),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: item.color,
                            foregroundColor: ColorConstants.surfaceWhite,
                            elevation: 0,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 8,
                            ),
                            minimumSize: Size.zero,
                            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          icon: const Icon(Icons.call_rounded, size: 14),
                          label: Text(
                            item.phoneNumber,
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),

            // Footer / Close Action
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
              child: SizedBox(
                width: double.infinity,
                child: TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  style: TextButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    backgroundColor: ColorConstants.divider,
                  ),
                  child: const Text(
                    'Hủy / Đóng',
                    style: TextStyle(
                      color: ColorConstants.textSubtle,
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
