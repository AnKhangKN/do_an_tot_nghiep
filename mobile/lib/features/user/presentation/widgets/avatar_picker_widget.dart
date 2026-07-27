import 'package:flutter/material.dart';
import '../../../../core/constants/color_constants.dart';

class AvatarPickerWidget extends StatelessWidget {
  final String? avatarUrl;
  final String fullName;
  final bool isUploading;
  final VoidCallback onTap;

  const AvatarPickerWidget({
    super.key,
    this.avatarUrl,
    required this.fullName,
    required this.isUploading,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final hasAvatar = avatarUrl != null && avatarUrl!.trim().isNotEmpty;
    final initialLetter = (fullName.isNotEmpty ? fullName[0] : "U").toUpperCase();

    return GestureDetector(
      onTap: isUploading ? null : onTap,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(4),
            decoration: const BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
            ),
            child: CircleAvatar(
              radius: 45,
              backgroundColor: ColorConstants.backgroundLight,
              backgroundImage: hasAvatar ? NetworkImage(avatarUrl!) : null,
              child: !hasAvatar
                  ? Text(
                      initialLetter,
                      style: const TextStyle(
                        fontSize: 36,
                        fontWeight: FontWeight.w900,
                        color: ColorConstants.redRescue,
                      ),
                    )
                  : null,
            ),
          ),

          // Lớp hiển thị hiệu ứng Loading khi đang upload ảnh
          if (isUploading)
            Container(
              width: 98,
              height: 98,
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.5),
                shape: BoxShape.circle,
              ),
              child: const Center(
                child: CircularProgressIndicator(
                  color: Colors.white,
                  strokeWidth: 3,
                ),
              ),
            ),

          // Nút Biểu tượng Máy ảnh để bấm đổi avatar
          Positioned(
            bottom: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: ColorConstants.redRescue,
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 2),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.2),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: const Icon(
                Icons.camera_alt,
                color: Colors.white,
                size: 16,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
