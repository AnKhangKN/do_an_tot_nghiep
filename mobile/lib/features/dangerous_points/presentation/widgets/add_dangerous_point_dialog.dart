import 'package:flutter/material.dart';
import 'package:mobile/core/constants/color_constants.dart';
import 'package:mobile/core/di/di.dart';
import 'package:mobile/core/dangerous_points/data/dangerous_point_repository.dart';
import 'package:mobile/core/utils/app_snackbar.dart';
import 'package:mobile/shared/widgtes/keyboard_safe_sheet.dart';

class AddDangerousPointDialog extends StatefulWidget {
  final double latitude;
  final double longitude;

  const AddDangerousPointDialog({
    super.key,
    required this.latitude,
    required this.longitude,
  });

  static Future<void> show(
    BuildContext context, {
    required double latitude,
    required double longitude,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) =>
          AddDangerousPointDialog(latitude: latitude, longitude: longitude),
    );
  }

  @override
  State<AddDangerousPointDialog> createState() =>
      _AddDangerousPointDialogState();
}

class _AddDangerousPointDialogState extends State<AddDangerousPointDialog> {
  final _formKey = GlobalKey<FormState>();
  final _zoneNameController = TextEditingController();
  final _addressController = TextEditingController();
  final _descriptionController = TextEditingController();
  String _selectedDangerLevel = 'MEDIUM';
  bool _isLoading = false;

  final List<String> _dangerLevels = ['LOW', 'MEDIUM', 'HIGH'];

  @override
  void dispose() {
    _zoneNameController.dispose();
    _addressController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_formKey.currentState?.validate() ?? false) {
      setState(() {
        _isLoading = true;
      });

      try {
        final repository = getIt<DangerousPointRepository>();
        await repository.createDangerousPoint(
          zoneName: _zoneNameController.text.trim(),
          address: _addressController.text.trim().isEmpty
              ? null
              : _addressController.text.trim(),
          description: _descriptionController.text.trim().isEmpty
              ? null
              : _descriptionController.text.trim(),
          latitude: widget.latitude,
          longitude: widget.longitude,
          dangerLevel: _selectedDangerLevel,
        );

        if (mounted) {
          Navigator.of(context).pop();
          AppSnackBar.show(
            context,
            'Báo cáo điểm nguy hiểm thành công!',
            type: AppSnackBarType.success,
          );
        }
      } catch (e) {
        if (mounted) {
          AppSnackBar.show(
            context,
            'Đã xảy ra lỗi. Vui lòng thử lại!',
            type: AppSnackBarType.error,
          );
        }
      } finally {
        if (mounted) {
          setState(() {
            _isLoading = false;
          });
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return KeyboardSafeSheet(
      child: Container(
        decoration: BoxDecoration(
          color: ColorConstants.surfaceWhite,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: const EdgeInsets.only(
          left: 20,
          right: 20,
          top: 20,
          bottom: 20,
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
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Thanh kéo drag handle
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
                            color: const Color(0xFFFFEDD5),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: const Icon(
                            Icons.warning_rounded,
                            color: Color(0xFFF97316),
                            size: 24,
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Báo cáo điểm nguy hiểm',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: ColorConstants.slateDark,
                                ),
                              ),
                              SizedBox(height: 2),
                              Text(
                                'Vui lòng cung cấp thông tin chi tiết',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: ColorConstants.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Divider(height: 1, color: ColorConstants.divider),
                    const SizedBox(height: 16),

                    // Tên khu vực
                    Text(
                      'Tên khu vực *',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: ColorConstants.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: _zoneNameController,
                      decoration: InputDecoration(
                        hintText: 'Ví dụ: Khu vực trơn trượt',
                        filled: true,
                        fillColor: ColorConstants.bgCanvas,
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
                          borderSide: BorderSide(
                            color: ColorConstants.slateDark,
                            width: 1.5,
                          ),
                        ),
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 14,
                        ),
                      ),
                      validator: (value) {
                        if (value?.trim().isEmpty ?? true) {
                          return 'Vui lòng nhập tên khu vực';
                        }
                        return null;
                      },
                      enabled: !_isLoading,
                    ),
                    const SizedBox(height: 16),

                    // Địa chỉ
                    Text(
                      'Địa chỉ (tùy chọn)',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: ColorConstants.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: _addressController,
                      decoration: InputDecoration(
                        hintText: 'Ví dụ: Đường ABC, Quận 1',
                        filled: true,
                        fillColor: ColorConstants.bgCanvas,
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
                          borderSide: BorderSide(
                            color: ColorConstants.slateDark,
                            width: 1.5,
                          ),
                        ),
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 14,
                        ),
                      ),
                      enabled: !_isLoading,
                    ),
                    const SizedBox(height: 16),

                    // Mức độ nguy hiểm
                    Text(
                      'Mức độ nguy hiểm *',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: ColorConstants.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 12,
                      runSpacing: 8,
                      children: _dangerLevels.map((level) {
                        final isSelected = _selectedDangerLevel == level;
                        final color = level == 'LOW'
                            ? const Color(0xFF22C55E)
                            : level == 'MEDIUM'
                            ? const Color(0xFFF59E0B)
                            : const Color(0xFFEF4444);

                        return ChoiceChip(
                          label: Text(
                            level == 'LOW'
                                ? 'Thấp'
                                : level == 'MEDIUM'
                                ? 'Trung bình'
                                : 'Cao',
                            style: TextStyle(
                              color: isSelected
                                  ? Colors.white
                                  : ColorConstants.textSecondary,
                              fontWeight: FontWeight.w600,
                              fontSize: 13,
                            ),
                          ),
                          selected: isSelected,
                          selectedColor: color,
                          backgroundColor: ColorConstants.bgCanvas,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                            side: BorderSide(
                              color: isSelected ? color : ColorConstants.border,
                              width: 1.5,
                            ),
                          ),
                          onSelected: _isLoading
                              ? null
                              : (selected) {
                                  if (selected) {
                                    setState(() {
                                      _selectedDangerLevel = level;
                                    });
                                  }
                                },
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 16),

                    // Mô tả
                    Text(
                      'Mô tả (tùy chọn)',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: ColorConstants.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: _descriptionController,
                      maxLines: 3,
                      decoration: InputDecoration(
                        hintText: 'Mô tả chi tiết về điểm nguy hiểm...',
                        filled: true,
                        fillColor: ColorConstants.bgCanvas,
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
                          borderSide: BorderSide(
                            color: ColorConstants.slateDark,
                            width: 1.5,
                          ),
                        ),
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 14,
                        ),
                      ),
                      enabled: !_isLoading,
                    ),
                    const SizedBox(height: 20),

                    // Footer / Buttons
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _isLoading ? null : _submit,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF0F172A),
                          foregroundColor: Colors.white,
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                        ),
                        child: _isLoading
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(
                                  color: Colors.white,
                                  strokeWidth: 2,
                                ),
                              )
                            : const Text(
                                'Gửi báo cáo',
                                style: TextStyle(
                                  fontWeight: FontWeight.w600,
                                  fontSize: 14,
                                ),
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
