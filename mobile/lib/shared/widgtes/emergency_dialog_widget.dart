import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/constants/color_constants.dart';
import '../../core/di/di.dart';
import '../../core/location/data/location_service.dart';
import '../../core/session/session_controller.dart';
import '../../core/utils/app_snackbar.dart';

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

class EmergencyDialogWidget extends StatefulWidget {
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

  @override
  State<EmergencyDialogWidget> createState() => _EmergencyDialogWidgetState();
}

class _EmergencyDialogWidgetState extends State<EmergencyDialogWidget> with SingleTickerProviderStateMixin {
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  final TextEditingController _customPhoneController = TextEditingController();
  
  late TabController _tabController;
  String? _savedEmergencyPhone;
  bool _isSavingPhone = false;
  bool _isLocating = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadCustomPhone();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _customPhoneController.dispose();
    super.dispose();
  }

  Future<void> _loadCustomPhone() async {
    final phone = await _storage.read(key: 'custom_emergency_phone');
    if (mounted && phone != null) {
      setState(() {
        _savedEmergencyPhone = phone;
        _customPhoneController.text = phone;
      });
    }
  }

  Future<void> _saveCustomPhone() async {
    final phone = _customPhoneController.text.trim();
    if (phone.isEmpty) return;

    setState(() => _isSavingPhone = true);
    await _storage.write(key: 'custom_emergency_phone', value: phone);
    if (mounted) {
      setState(() {
        _savedEmergencyPhone = phone;
        _isSavingPhone = false;
      });
      AppSnackBar.show(
        context,
        'Đã lưu số điện thoại người thân khẩn cấp!',
        type: AppSnackBarType.success,
      );
    }
  }

  Future<void> _makeCall(String phoneNumber) async {
    final Uri uri = Uri.parse('tel:$phoneNumber');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  Future<void> _sendSmsGps({String? recipientPhone}) async {
    setState(() => _isLocating = true);
    try {
      final session = getIt<SessionController>();
      var position = session.state.position;
      position ??= await LocationService().getCurrentPosition();

      String message;
      if (position != null) {
        final mapsUrl = 'https://maps.google.com/?q=${position.latitude},${position.longitude}';
        message = 'SOS KHAN CAP! Toi dang can tro giup gap tai vi tri GPS: $mapsUrl';
      } else {
        message = 'SOS KHAN CAP! Toi dang gap su co nguy hiem va can duoc ho tro khan cap!';
      }

      final String? targetPath = (recipientPhone != null && recipientPhone.trim().isNotEmpty)
          ? recipientPhone.trim()
          : null;

      final Uri smsUri = Uri(
        scheme: 'sms',
        path: targetPath,
        queryParameters: <String, String>{
          'body': message,
        },
      );

      if (await canLaunchUrl(smsUri)) {
        await launchUrl(smsUri, mode: LaunchMode.externalApplication);
      } else {
        // Fallback: Thử gọi launchUrl trực tiếp với externalApplication
        await launchUrl(smsUri, mode: LaunchMode.externalNonBrowserApplication);
      }
    } catch (e) {
      debugPrint('Error sending SMS GPS: $e');
    } finally {
      if (mounted) {
        setState(() => _isLocating = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.78,
      ),
      decoration: BoxDecoration(
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
              padding: const EdgeInsets.fromLTRB(20, 18, 12, 12),
              decoration: BoxDecoration(
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
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Kênh Khẩn Cấp Đa Phương Thức',
                          style: TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.bold,
                            color: ColorConstants.slateDark,
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Gọi tổng đài, phát SMS GPS & Người thân 24/7',
                          style: TextStyle(
                            fontSize: 11,
                            color: ColorConstants.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: Icon(Icons.close, color: ColorConstants.textMuted),
                    tooltip: 'Đóng',
                  ),
                ],
              ),
            ),

            // Tab Bar Navigation
            TabBar(
              controller: _tabController,
              labelColor: ColorConstants.danger,
              unselectedLabelColor: ColorConstants.textMuted,
              indicatorColor: ColorConstants.danger,
              indicatorWeight: 3,
              labelStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
              tabs: const [
                Tab(icon: Icon(Icons.call_rounded, size: 18), text: 'Tổng Đài'),
                Tab(icon: Icon(Icons.sms_rounded, size: 18), text: 'SMS GPS'),
                Tab(icon: Icon(Icons.contact_phone_rounded, size: 18), text: 'Người Thân'),
              ],
            ),

            // Tab Content Body
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  // Tab 1: Hotline Tổng đài
                  _buildHotlineTab(),

                  // Tab 2: Phát SMS GPS
                  _buildSmsGpsTab(bottomInset),

                  // Tab 3: Người thân khẩn cấp
                  _buildPersonalContactTab(bottomInset),
                ],
              ),
            ),

            // Footer
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 6, 16, 12),
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
                  child: Text(
                    'Đóng',
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

  Widget _buildHotlineTab() {
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: EmergencyDialogWidget._contacts.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (context, index) {
        final item = EmergencyDialogWidget._contacts[index];
        return Container(
          decoration: BoxDecoration(
            color: ColorConstants.bgCanvas,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: ColorConstants.border),
          ),
          child: ListTile(
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            leading: Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: item.color.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(item.icon, color: item.color, size: 22),
            ),
            title: Text(
              item.title,
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: ColorConstants.textPrimary),
            ),
            subtitle: Text(
              item.description,
              style: TextStyle(fontSize: 11, color: ColorConstants.textMuted),
            ),
            trailing: ElevatedButton.icon(
              onPressed: () => _makeCall(item.phoneNumber),
              style: ElevatedButton.styleFrom(
                backgroundColor: item.color,
                foregroundColor: Colors.white,
                elevation: 0,
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              icon: const Icon(Icons.call_rounded, size: 14),
              label: Text(item.phoneNumber, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
            ),
          ),
        );
      },
    );
  }

  Widget _buildSmsGpsTab(double bottomInset) {
    return SingleChildScrollView(
      padding: EdgeInsets.fromLTRB(20, 20, 20, 20 + bottomInset),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: ColorConstants.purpleQR.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.location_on_rounded, size: 48, color: ColorConstants.purpleQR),
          ),
          const SizedBox(height: 16),
          Text(
            'Phát SMS Khẩn Cấp Kèm GPS',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: ColorConstants.slateDark),
          ),
          const SizedBox(height: 8),
          Text(
            'Tự động gửi tin nhắn kèm đường dẫn vị trí Google Maps đến lực lượng cứu hộ hoặc bất kỳ số điện thoại nào.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 12, color: ColorConstants.textMuted, height: 1.4),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton.icon(
              onPressed: _isLocating ? null : () => _sendSmsGps(),
              style: ElevatedButton.styleFrom(
                backgroundColor: ColorConstants.danger,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                elevation: 2,
              ),
              icon: _isLocating
                  ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Icon(Icons.sms_rounded),
              label: Text(
                _isLocating ? 'Đang đọc GPS...' : 'Phát SMS GPS Ngay',
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPersonalContactTab(double bottomInset) {
    return SingleChildScrollView(
      padding: EdgeInsets.fromLTRB(20, 20, 20, 20 + bottomInset),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Số Điện Thoại Người Thân Tin Cậy',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: ColorConstants.slateDark),
          ),
          const SizedBox(height: 4),
          Text(
            'Lưu sẵn số người thân để gọi hoặc nhắn tọa độ GPS nhanh trong tình huống nguy hiểm.',
            style: TextStyle(fontSize: 12, color: ColorConstants.textMuted),
          ),
          const SizedBox(height: 16),

          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _customPhoneController,
                  keyboardType: TextInputType.phone,
                  decoration: InputDecoration(
                    hintText: 'Nhập SĐT người thân (VD: 0912345678)',
                    hintStyle: TextStyle(fontSize: 12, color: ColorConstants.textMuted),
                    prefixIcon: const Icon(Icons.phone, size: 18, color: ColorConstants.primary),
                    filled: true,
                    fillColor: ColorConstants.bgCanvas,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: BorderSide(color: ColorConstants.border),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: BorderSide(color: ColorConstants.border),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              ElevatedButton(
                onPressed: _isSavingPhone ? null : _saveCustomPhone,
                style: ElevatedButton.styleFrom(
                  backgroundColor: ColorConstants.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: _isSavingPhone
                    ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Text('Lưu', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          ),

          if (_savedEmergencyPhone != null && _savedEmergencyPhone!.isNotEmpty) ...[
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: ColorConstants.primary.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: ColorConstants.primary.withValues(alpha: 0.2)),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      const Icon(Icons.verified_user_rounded, color: ColorConstants.primary, size: 24),
                      const SizedBox(width: 10),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Đã kết nối người thân:', style: TextStyle(fontSize: 11, color: ColorConstants.textMuted)),
                          Text(
                            _savedEmergencyPhone!,
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: ColorConstants.slateDark),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () => _makeCall(_savedEmergencyPhone!),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: ColorConstants.amenityGreen,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                          icon: const Icon(Icons.call, size: 16),
                          label: const Text('Gọi Ngay', style: TextStyle(fontWeight: FontWeight.bold)),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () => _sendSmsGps(recipientPhone: _savedEmergencyPhone!),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: ColorConstants.dangerHigh,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                          icon: const Icon(Icons.sms, size: 16),
                          label: const Text('Gửi SMS GPS', style: TextStyle(fontWeight: FontWeight.bold)),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
