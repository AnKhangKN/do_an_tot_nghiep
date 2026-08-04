import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../../../../core/di/di.dart';
import '../../../../core/session/session_controller.dart';
import '../../../../core/socket/modules/victim_socket.dart';
import '../../../../core/constants/color_constants.dart';
import '../../../../core/constants/router_constants.dart';
import '../../../../core/location/data/location_service.dart';
import '../../../../core/utils/app_snackbar.dart';
import '../../../../shared/widgtes/image_picker_helper.dart';
import '../../../../shared/widgtes/keyboard_safe_sheet.dart';
import '../../../victim/presentation/providers/victim_map_provider.dart';
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

  String? _selectedIncidentTypeId;
  XFile? _selectedImage;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = context.read<VictimMapProvider>();
      if (provider.incidentTypes.isEmpty) {
        provider.loadIncidentTypes();
      }
    });
  }

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

    if (_selectedIncidentTypeId == null) {
      AppSnackBar.show(
        context,
        'Vui lòng chọn loại sự cố / tai nạn!',
        type: AppSnackBarType.warning,
      );
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
      AppSnackBar.show(
        context,
        authProvider.error ?? 'Đã xảy ra lỗi khi xác thực vị trí khẩn cấp!',
        type: AppSnackBarType.error,
      );
      return;
    }

    // 2. Kích hoạt listener socket của Victim để nhận phản hồi tìm cứu hộ
    try {
      getIt<VictimSocket>().listenSosNotFound();
    } catch (e) {
      debugPrint("⚠️ [GUEST SOS] Lỗi khi đăng ký socket listener: $e");
    }

    // 3. Lấy vị trí GPS (Ưu tiên lấy vị trí đã có trong SessionController)
    final sessionController = getIt<SessionController>();
    var position = sessionController.state.position;
    position ??= await LocationService().getCurrentPosition();

    if (position == null || !mounted) {
      setState(() {
        _isSubmitting = false;
      });
      AppSnackBar.show(
        context,
        'Không thể lấy vị trí GPS hiện tại. Vui lòng bật vị trí!',
        type: AppSnackBarType.error,
      );
      return;
    }

    if (!mounted) return;

    // 4. Đặt trạng thái đang tìm kiếm cứu hộ NGAY LẬP TỨC để VictimSearchingWidget hiển thị khi vào map
    sessionController.setSearchingRescuer(true);

    // 5. Lấy reference provider trước khi pop (sau pop context có thể không còn hợp lệ)
    final victimProvider = context.read<VictimMapProvider>();
    final desc = description.isNotEmpty ? description : 'Cứu hộ khẩn cấp từ nạn nhân chưa có tài khoản';
    final capturedPhone = phone;
    final capturedIncidentTypeId = _selectedIncidentTypeId!;
    final capturedImagePath = _selectedImage?.path;
    final capturedLat = position.latitude;
    final capturedLng = position.longitude;

    // 6. Đóng dialog và navigate vào map ngay lập tức
    Navigator.of(context).pop();
    context.go(RouterConstants.map);

    // 7. Gửi SOS lên server bất đồng bộ sau khi đã vào map
    final sosSuccess = await victimProvider.sendSos(
      capturedPhone,
      capturedIncidentTypeId,
      desc,
      capturedLat,
      capturedLng,
      imagePath: capturedImagePath,
    );

    if (!sosSuccess) {
      // Nếu gửi thất bại thì tắt trạng thái đang tìm kiếm
      sessionController.setSearchingRescuer(false);
      debugPrint("❌ [GUEST SOS] Gửi SOS thất bại: ${victimProvider.errorMessage}");
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return KeyboardSafeSheet(
      child: Container(
        decoration: BoxDecoration(
          color: ColorConstants.surfaceWhite,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: const EdgeInsets.only(
          left: 20,
          right: 20,
          top: 16,
          bottom: 16,
        ),
        child: Form(
          key: _formKey,
          child: DraggableScrollableSheet(
            expand: false,
            minChildSize: 0.3,
            initialChildSize: 0.9,
            maxChildSize: 1.0,
            shouldCloseOnMinExtent: true,
            builder: (context, scrollController) {
              return SingleChildScrollView(
                controller: scrollController,
                physics: const BouncingScrollPhysics(),
                padding: EdgeInsets.only(bottom: bottomInset),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Thanh gạch ngang nhỏ
                    Center(
                      child: Container(
                        width: 40,
                        height: 4,
                        margin: const EdgeInsets.only(bottom: 14),
                        decoration: BoxDecoration(
                          color: ColorConstants.borderDark,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),

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
                        Expanded(
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
                              const SizedBox(height: 2),
                              Text(
                                'Gửi tín hiệu SOS trực tiếp không cần tạo tài khoản',
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
                          icon: Icon(Icons.close, color: ColorConstants.textMuted),
                        ),
                      ],
                    ),

                    const SizedBox(height: 18),

                    // Ô nhập Số điện thoại (BẮT BỘC & VALIDATE REGEX)
                    Text(
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
                          borderSide: BorderSide(color: ColorConstants.border),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: BorderSide(color: ColorConstants.border),
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

                    // Dropdown Chọn loại sự cố / tai nạn (*)
                    Text(
                      'Loại sự cố / tai nạn *',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: ColorConstants.slateDark,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Consumer<VictimMapProvider>(
                      builder: (context, provider, child) {
                        if (provider.loadingIncidentTypes) {
                          return Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: ColorConstants.bgCanvas,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: ColorConstants.border),
                            ),
                            child: const Row(
                              children: [
                                SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(strokeWidth: 2),
                                ),
                                SizedBox(width: 10),
                                Text('Đang tải danh sách loại sự cố...', style: TextStyle(fontSize: 12)),
                              ],
                            ),
                          );
                        }

                        return DropdownButtonFormField<String>(
                          value: _selectedIncidentTypeId,
                          isExpanded: true,
                          hint: Text('Chọn loại sự cố / tai nạn', style: TextStyle(fontSize: 13, color: ColorConstants.textMuted)),
                          style: TextStyle(fontSize: 14, color: ColorConstants.slateDark, fontWeight: FontWeight.w600),
                          decoration: InputDecoration(
                            prefixIcon: const Icon(Icons.warning_amber_rounded, color: ColorConstants.dangerHigh, size: 20),
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
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(14),
                              borderSide: const BorderSide(color: ColorConstants.dangerHigh, width: 1.5),
                            ),
                          ),
                          items: provider.incidentTypes.map((item) {
                            return DropdownMenuItem<String>(
                              value: item.incidentTypeId,
                              child: Text(item.incidentType),
                            );
                          }).toList(),
                          onChanged: (val) {
                            setState(() {
                              _selectedIncidentTypeId = val;
                            });
                          },
                          validator: (val) => val == null ? 'Vui lòng chọn loại sự cố / tai nạn!' : null,
                        );
                      },
                    ),

                    const SizedBox(height: 14),

                    // Ô nhập Tên của bạn (Tùy chọn)
                    Text(
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
                          borderSide: BorderSide(color: ColorConstants.border),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: BorderSide(color: ColorConstants.border),
                        ),
                      ),
                    ),

                    const SizedBox(height: 14),

                    // Ô nhập Mô tả tình trạng (Tùy chọn)
                    Text(
                      'Mô tả chi tiết tình trạng (Tùy chọn)',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: ColorConstants.slateDark,
                      ),
                    ),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: _descriptionController,
                      maxLines: 2,
                      style: const TextStyle(fontSize: 13),
                      decoration: InputDecoration(
                        hintText: 'Nhập vị trí cụ thể hoặc tình trạng bạn đang gặp...',
                        hintStyle: TextStyle(fontSize: 12, color: ColorConstants.textMuted),
                        prefixIcon: const Icon(Icons.description_outlined, color: ColorConstants.primary, size: 20),
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

                    const SizedBox(height: 14),

                    // Ô đính kèm ảnh hiện trường (Tùy chọn)
                    Text(
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
              );
            },
          ),
        ),
      ),
    );
  }
}
