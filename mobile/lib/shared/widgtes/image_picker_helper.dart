import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../core/constants/color_constants.dart';

class ImagePickerHelper {
  /// Hiển thị BottomSheet cho phép người dùng chọn Chụp ảnh trực tiếp từ Máy ảnh hoặc Chọn ảnh từ Thư viện
  static Future<XFile?> pickImage(BuildContext context) async {
    final source = await showModalBottomSheet<ImageSource>(
      context: context,
      backgroundColor: ColorConstants.surfaceWhite,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 36,
                height: 4,
                decoration: BoxDecoration(
                  color: ColorConstants.borderDark,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Tải ảnh lên',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              const SizedBox(height: 12),
              ListTile(
                leading: const Icon(Icons.camera_alt_rounded, color: Colors.redAccent),
                title: const Text('Chụp ảnh trực tiếp từ máy ảnh', style: TextStyle(fontWeight: FontWeight.w600)),
                onTap: () => Navigator.pop(ctx, ImageSource.camera),
              ),
              ListTile(
                leading: const Icon(Icons.photo_library_rounded, color: Colors.blueAccent),
                title: const Text('Chọn ảnh sẵn có từ Thư viện', style: TextStyle(fontWeight: FontWeight.w600)),
                onTap: () => Navigator.pop(ctx, ImageSource.gallery),
              ),
              const Divider(),
              ListTile(
                leading: Icon(Icons.close_rounded, color: ColorConstants.textSecondary),
                title: Text('Hủy / Bỏ qua (Không tải ảnh)', style: TextStyle(fontWeight: FontWeight.w500, color: ColorConstants.textSecondary)),
                onTap: () => Navigator.pop(ctx, null),
              ),

            ],
          ),
        ),
      ),
    );

    if (source == null) return null;

    final picker = ImagePicker();
    return await picker.pickImage(
      source: source,
      imageQuality: 80,
    );
  }
}
