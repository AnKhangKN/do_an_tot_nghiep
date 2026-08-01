import 'package:flutter/material.dart';
import 'package:mobile/core/constants/color_constants.dart';

class RescueCompletionDialogWidget extends StatelessWidget {
  final String? victimName;

  const RescueCompletionDialogWidget({
    super.key,
    this.victimName,
  });

  static Future<bool?> show(BuildContext context, {String? victimName}) {
    return showDialog<bool>(
      context: context,
      barrierDismissible: true,
      builder: (dialogContext) => RescueCompletionDialogWidget(victimName: victimName),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
      ),
      elevation: 8,
      backgroundColor: ColorConstants.surfaceWhite,
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Icon Header
            Container(
              width: 56,
              height: 56,
              decoration: const BoxDecoration(
                color: Color(0xFFDCFCE7),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.check_circle_rounded,
                color: Color(0xFF16A34A),
                size: 36,
              ),
            ),
            const SizedBox(height: 16),

            // Title
            Text(
              'Xác nhận hoàn thành?',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: ColorConstants.slateDark,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 10),

            // Message
            Text(
              victimName != null && victimName!.isNotEmpty
                  ? 'Bạn có chắc chắn đã hoàn tất hỗ trợ cho nạn nhân "$victimName" không?\nSau khi xác nhận, ca cứu hộ sẽ chính thức kết thúc.'
                  : 'Bạn có chắc chắn ca cứu hộ này đã được xử lý hoàn tất không?\nSau khi xác nhận, ca cứu hộ sẽ chính thức kết thúc.',
              style: TextStyle(
                fontSize: 13.5,
                color: ColorConstants.textSecondary,
                height: 1.4,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 22),

            // Action Buttons
            Row(
              children: [
                // Cancel Button
                Expanded(
                  child: OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      side: BorderSide(color: ColorConstants.borderDark, width: 1.2),
                      backgroundColor: ColorConstants.bgCanvas,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 0,
                    ),
                    onPressed: () => Navigator.of(context).pop(false),
                    child: Text(
                      'Quay lại',
                      style: TextStyle(
                        color: ColorConstants.textSecondary,
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),

                // Confirm Button
                Expanded(
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF16A34A),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 0,
                    ),
                    onPressed: () => Navigator.of(context).pop(true),
                    child: const Text(
                      'Hoàn thành',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
