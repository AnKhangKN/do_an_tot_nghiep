import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
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
  final TextEditingController _hoursController = TextEditingController(text: '07:00 - 21:00');

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

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedCategoryId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng chọn loại tiện ích')),
      );
      return;
    }

    final provider = context.read<AmenityProvider>();
    final success = await provider.addAmenity(
      amenityCategoryId: _selectedCategoryId!,
      latitude: widget.currentLat,
      longitude: widget.currentLng,
      phone: _phoneController.text.trim(),
      openingHours: _hoursController.text.trim(),
    );

    if (mounted) {
      if (success) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Đóng góp thành công! Tiện ích sẽ hiển thị sau khi Admin duyệt.'),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 4),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Đóng góp thất bại. Vui lòng thử lại!'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Consumer<AmenityProvider>(
        builder: (context, provider, child) {
          return Form(
            key: _formKey,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.grey[300],
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Đóng góp Tiện ích Khẩn cấp',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Chia sẻ vị trí điểm tiện ích (Sửa xe, trạm xăng, y tế) hỗ trợ người đi đường.',
                    style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                  ),
                  const SizedBox(height: 16),

                  // Dropdown chọn Danh mục
                  const Text(
                    'Loại tiện ích (*)',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
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
                      fillColor: Colors.grey[100],
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
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
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 6),
                  TextFormField(
                    controller: _phoneController,
                    keyboardType: TextInputType.phone,
                    decoration: InputDecoration(
                      hintText: 'Nhập số điện thoại tiệm / trạm',
                      filled: true,
                      fillColor: Colors.grey[100],
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
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
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 6),
                  TextFormField(
                    controller: _hoursController,
                    decoration: InputDecoration(
                      hintText: 'VD: 07:00 - 21:00 hoặc 24/7',
                      filled: true,
                      fillColor: Colors.grey[100],
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
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
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                            )
                          : const Text(
                              'Đóng góp điểm ngay',
                              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                            ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
