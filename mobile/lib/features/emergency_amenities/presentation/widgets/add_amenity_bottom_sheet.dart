import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../../../../core/constants/color_constants.dart';
import '../../../../core/utils/app_snackbar.dart';
import '../../../../shared/widgtes/image_picker_helper.dart';
import '../../../../shared/widgtes/keyboard_safe_sheet.dart';
import '../providers/amenity_provider.dart';

class AddAmenityBottomSheet extends StatefulWidget {
  final double currentLat;
  final double currentLng;

  const AddAmenityBottomSheet({
    super.key,
    required this.currentLat,
    required this.currentLng,
  });

  @override
  State<AddAmenityBottomSheet> createState() => _AddAmenityBottomSheetState();
}

class _AddAmenityBottomSheetState extends State<AddAmenityBottomSheet> {
  final _formKey = GlobalKey<FormState>();
  String? _selectedCategoryId;
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _hoursController = TextEditingController(
    text: '07:00 - 21:00',
  );
  XFile? _selectedImage;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = context.read<AmenityProvider>();
      if (provider.categories.isEmpty) {
        provider.fetchCategories();
      }
    });
  }

  @override
  void dispose() {
    _phoneController.dispose();
    _hoursController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final image = await ImagePickerHelper.pickImage(context);
    if (image != null) {
      setState(() {
        _selectedImage = image;
      });
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    if (_selectedImage == null) {
      AppSnackBar.show(
        context,
        'Vui lòng chụp hoặc tải lên hình ảnh minh họa tiện ích (*)',
        type: AppSnackBarType.warning,
      );
      return;
    }

    if (_selectedCategoryId == null) {
      AppSnackBar.show(context, 'Vui lòng chọn loại tiện ích');
      return;
    }

    final provider = context.read<AmenityProvider>();
    final success = await provider.addAmenity(
      amenityCategoryId: _selectedCategoryId!,
      latitude: widget.currentLat,
      longitude: widget.currentLng,
      phone: _phoneController.text.trim(),
      openingHours: _hoursController.text.trim(),
      imagePath: _selectedImage?.path,
    );

    if (mounted) {
      if (success) {
        Navigator.pop(context);
        AppSnackBar.show(
          context,
          'Đóng góp thành công! Tiện ích sẽ hiển thị sau khi Admin duyệt.',
          type: AppSnackBarType.success,
          duration: const Duration(seconds: 4),
        );
      } else {
        AppSnackBar.show(
          context,
          'Đóng góp thất bại. Vui lòng thử lại!',
          type: AppSnackBarType.error,
        );
      }
    }
  }

  Widget _buildImagePicker() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Hình ảnh minh họa (*)',
          style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 6),
        if (_selectedImage == null)
          GestureDetector(
            onTap: _pickImage,
            child: Container(
              height: 80,
              width: double.infinity,
              decoration: BoxDecoration(
                color: ColorConstants.bgCanvas,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: ColorConstants.borderDark),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.add_a_photo_outlined,
                    color: ColorConstants.textSecondary,
                    size: 24,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Chọn ảnh tiện ích (*)',
                    style: TextStyle(
                      fontSize: 13,
                      color: ColorConstants.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          )
        else
          Stack(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: Image.file(
                  File(_selectedImage!.path),
                  height: 120,
                  width: double.infinity,
                  fit: BoxFit.cover,
                ),
              ),
              Positioned(
                top: 8,
                right: 8,
                child: GestureDetector(
                  onTap: () {
                    setState(() {
                      _selectedImage = null;
                    });
                  },
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: Colors.black54,
                      shape: BoxShape.circle,
                    ),

                    child: const Icon(
                      Icons.close,
                      color: Colors.white,
                      size: 18,
                    ),
                  ),
                ),
              ),
            ],
          ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return KeyboardSafeSheet(
      child: Container(
        padding: const EdgeInsets.only(
          left: 20,
          right: 20,
          top: 20,
          bottom: 20,
        ),
        decoration: BoxDecoration(
          color: ColorConstants.surfaceWhite,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Consumer<AmenityProvider>(
          builder: (context, provider, child) {
            return Form(
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
                        Center(
                          child: Container(
                            width: 40,
                            height: 4,
                            decoration: BoxDecoration(
                              color: ColorConstants.borderDark,
                              borderRadius: BorderRadius.circular(2),
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Đóng góp Tiện ích Khẩn cấp',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: ColorConstants.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Chia sẻ vị trí điểm tiện ích (Sửa xe, trạm xăng, y tế) hỗ trợ người đi đường.',
                          style: TextStyle(
                            fontSize: 12,
                            color: ColorConstants.textSecondary,
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Dropdown chọn Danh mục
                        const Text(
                          'Loại tiện ích (*)',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 6),
                        DropdownButtonFormField<String>(
                          value: _selectedCategoryId,
                          isExpanded: true,
                          hint: const Text('Chọn loại tiện ích'),
                          items: provider.categories.map((cat) {
                            return DropdownMenuItem<String>(
                              value: cat.amenityCategoryId,
                              child: Text(cat.categoryName),
                            );
                          }).toList(),
                          onChanged: (val) {
                            setState(() {
                              _selectedCategoryId = val;
                            });
                          },
                          decoration: InputDecoration(
                            filled: true,
                            fillColor: ColorConstants.bgCanvas,
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 12,
                            ),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: BorderSide.none,
                            ),
                          ),
                        ),
                        const SizedBox(height: 14),

                        // SĐT liên hệ
                        const Text(
                          'Số điện thoại liên hệ (Không bắt buộc)',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 6),
                        TextFormField(
                          controller: _phoneController,
                          keyboardType: TextInputType.phone,
                          decoration: InputDecoration(
                            hintText: 'Nhập số điện thoại tiệm / trạm',
                            filled: true,
                            fillColor: ColorConstants.bgCanvas,
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 12,
                            ),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: BorderSide.none,
                            ),
                          ),
                        ),
                        const SizedBox(height: 14),

                        // Giờ mở cửa
                        const Text(
                          'Giờ mở cửa',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 6),
                        TextFormField(
                          controller: _hoursController,
                          decoration: InputDecoration(
                            hintText: 'VD: 07:00 - 21:00 hoặc 24/7',
                            filled: true,
                            fillColor: ColorConstants.bgCanvas,
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 12,
                            ),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: BorderSide.none,
                            ),
                          ),
                        ),
                        const SizedBox(height: 14),

                        // Ảnh minh họa (Bắt buộc)
                        _buildImagePicker(),

                        const SizedBox(height: 24),

                        // Button Gửi
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: provider.isSubmitting ? null : _submit,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.black87,
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                            ),
                            child: provider.isSubmitting
                                ? const SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(
                                      color: Colors.white,
                                      strokeWidth: 2,
                                    ),
                                  )
                                : const Text(
                                    'Đóng góp điểm ngay',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            );
          },
        ),
      ),
    );
  }
}
