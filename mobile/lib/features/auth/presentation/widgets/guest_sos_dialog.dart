import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';

import '../../../../core/constants/color_constants.dart';
import '../../../../core/location/data/location_service.dart';
import '../../../../shared/widgtes/image_picker_helper.dart';
import '../../../victim/presentation/providers/victim_map_provider.dart';
import '../../../victim/presentation/screens/victim_map_screen.dart';
import '../providers/auth_provider.dart';

class GuestSOSDialog extends StatefulWidget {
  const GuestSOSDialog({super.key});

  static Future<void> show(BuildContext context) async {
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const GuestSOSDialog(),
    );
  }

  @override
  State<GuestSOSDialog> createState() => _GuestSOSDialogState();
}

class _GuestSOSDialogState extends State<GuestSOSDialog> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();

  XFile? _selectedImage;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _phoneController.dispose();
    _nameController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final picked = await ImagePickerHelper.pickImage(context);
    if (picked != null) {
      setState(() {
        _selectedImage = picked;
      });
    }
  }

  Future<void> _submitGuestSOS() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    final phone = _phoneController.text.trim();
    final name = _nameController.text.trim().isNotEmpty ? _nameController.text.trim() : 'Nạn nhân Khách';
    final description = _descriptionController.text.trim();

    final authProvider = context.read<AuthProvider>();

    // 1. Thực hiện Đăng nhập ngầm dạng Guest
    final success = await authProvider.guestLogin(phone, name);

    if (!success || !mounted) {
      setState(() {
        _isSubmitting = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(authProvider.error ?? 'Đã xảy ra lỗi khi xác thực vị trí khẩn cấp!'),
          backgroundColor: ColorConstants.dangerHigh,
        ),
      );
      return;
    }

    // 2. Lấy vị trí GPS hiện tại
    final position = await LocationService().getCurrentPosition();
    if (position == null || !mounted) {
      setState(() {
        _isSubmitting = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Không thể lấy vị trí GPS hiện tại. Vui lòng bật vị trí!'),
          backgroundColor: ColorConstants.dangerHigh,
        ),
      );
      return;
    }

    // 3. Tạo yêu cầu SOS gửi lên server
    try {
      final victimProvider = context.read<VictimMapProvider>();
      final desc = description.isNotEmpty ? description : 'Cứu hộ khẩn cấp từ nạn nhân chưa có tài khoản';

      await victimProvider.sendSos(
        phone,
        '',
        desc,
        position.latitude,
        position.longitude,
        imagePath: _selectedImage?.path,
      );

      if (!mounted) return;

      Navigator.of(context).pop(); // Đóng BottomSheet

      // Chuyển trực tiếp tới màn hình Bản đồ Nạn nhân để theo dõi cứu hộ
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const VictimMapScreen()),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isSubmitting = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Lỗi gửi cứu hộ: $e'),
          backgroundColor: ColorConstants.dangerHigh,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Container(
        decoration: const BoxDecoration(
          color: ColorConstants.surfaceWhite,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(28),
            topRight: Radius.circular(28),
          ),
        ),
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
        child: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Thanh gạch ngang nhỏ
                Center(
                  child: Container(
                    width: 38,
                    height: 4,
                    decoration: BoxDecoration(
                      color: ColorConstants.borderDark,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Header
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: ColorConstants.dangerHighLight,
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: const Icon(
                        Icons.sos_rounded,
                        color: ColorConstants.dangerHigh,
                        size: 26,
                      ),
                    ),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Cứu Hộ Khẩn Cấp (Chưa có tài khoản)',
                            style: TextStyle(
                              fontSize: 17,
                              fontWeight: FontWeight.bold,
                              color: ColorConstants.slateDark,
                            ),
                          ),
                          SizedBox(height: 2),
                          Text(
                            'Gửi yêu cầu tức thì mà không cần tạo tài khoản',
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
                    ),
                  ],
                ),

                const SizedBox(height: 18),

                // Ô nhập Số điện thoại (BẮT BỘC & VALIDATE REGEX)
                const Text(
                  'Số điện thoại liên hệ *',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: ColorConstants.slateDark,
                  ),
                ),
                const SizedBox(height: 6),
                TextFormField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                  decoration: InputDecoration(
                    hintText: 'Nhập SĐT của bạn (VD: 0912345678)',
                    prefixIcon: const Icon(Icons.phone_rounded, color: ColorConstants.dangerHigh, size: 20),
                    filled: true,
                    fillColor: ColorConstants.bgCanvas,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: ColorConstants.border),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: ColorConstants.border),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: ColorConstants.dangerHigh, width: 1.5),
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Vui lòng nhập số điện thoại để Cứu hộ viên liên hệ!';
                    }
                    final clean = value.trim();
                    final regex = RegExp(r'^(0[3|5|7|8|9])+([0-9]{8})$');
                    if (!regex.hasMatch(clean)) {
                      return 'Số điện thoại không đúng định dạng VN (10 chữ số, đầu 03/05/07/08/09)';
                    }
                    return null;
                  },
                ),

                const SizedBox(height: 14),

                // Ô nhập Tên của bạn (Tùy chọn)
                const Text(
                  'Tên của bạn (Tùy chọn)',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: ColorConstants.slateDark,
                  ),
                ),
                const SizedBox(height: 6),
                TextFormField(
                  controller: _nameController,
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                  decoration: InputDecoration(
                    hintText: 'Mặc định: Nạn nhân Khách',
                    prefixIcon: const Icon(Icons.person_rounded, color: ColorConstants.primary, size: 20),
                    filled: true,
                    fillColor: ColorConstants.bgCanvas,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: ColorConstants.border),
                    ),
                  ),
                ),

                const SizedBox(height: 14),

                // Ô đính kèm ảnh hiện trường (Tùy chọn)
                const Text(
                  'Ảnh hiện trường tai nạn (Tùy chọn)',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: ColorConstants.slateDark,
                  ),
                ),
                const SizedBox(height: 6),
                InkWell(
                  onTap: _pickImage,
                  borderRadius: BorderRadius.circular(14),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    decoration: BoxDecoration(
                      color: ColorConstants.bgCanvas,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: ColorConstants.border),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.camera_alt_rounded, color: ColorConstants.dangerMedium, size: 22),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            _selectedImage != null
                                ? 'Đã chọn ảnh hiện trường'
                                : 'Chụp / Chọn ảnh hiện trường...',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: _selectedImage != null ? FontWeight.bold : FontWeight.w500,
                              color: _selectedImage != null ? ColorConstants.amenityGreen : ColorConstants.textMuted,
                            ),
                          ),
                        ),
                        if (_selectedImage != null)
                          IconButton(
                            icon: const Icon(Icons.close, size: 18, color: ColorConstants.dangerHigh),
                            onPressed: () {
                              setState(() {
                                _selectedImage = null;
                              });
                            },
                          ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 20),

                // Nút Gửi Cứu Hộ Khẩn Cấp
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: _isSubmitting ? null : _submitGuestSOS,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: ColorConstants.dangerHigh,
                      foregroundColor: ColorConstants.surfaceWhite,
                      elevation: 4,
                      shadowColor: ColorConstants.shadowHigh,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    child: _isSubmitting
                        ? const CircularProgressIndicator(color: Colors.white)
                        : const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.sos_rounded, size: 24),
                              SizedBox(width: 8),
                              Text(
                                '🆘 GỬI YÊU CẦU CỨU HỘ KHẨN CẤP',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 0.3,
                                ),
                              ),
                            ],
                          ),
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
