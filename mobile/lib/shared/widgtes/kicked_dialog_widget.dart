import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';
import 'package:mobile/core/session/session_controller.dart';
import '../../core/constants/color_constants.dart';

/// Hiển thị thông báo khi tài khoản bị kick/chặn do "single active session" (đã được auto-logout):
/// - Bị đăng nhập trên thiết bị khác.
/// - Đang tham gia ca cứu hộ ở thiết bị khác.
/// Hiển thị trên màn hình Login sau khi tự động đăng xuất. Bấm "Đã hiểu" chỉ đóng dialog.
class KickedDialogWidget extends StatelessWidget {
  final String message;

  const KickedDialogWidget({super.key, required this.message});

  static void show(BuildContext context, {required String message}) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => KickedDialogWidget(message: message),
    );
  }

  void _handleClose(BuildContext context) {
    Navigator.of(context).pop();
    GetIt.instance<SessionController>().consumeKickedMessage();
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      child: AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
        ),
        contentPadding: const EdgeInsets.fromLTRB(24, 28, 24, 12),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: ColorConstants.primary.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.phonelink_erase_rounded,
                size: 36,
                color: ColorConstants.primary,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Phiên đăng nhập',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: ColorConstants.slateDark,
              ),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: ColorConstants.primary.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: ColorConstants.primary.withValues(alpha: 0.2),
                ),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(
                    Icons.info_outline_rounded,
                    size: 18,
                    color: ColorConstants.primary,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      message,
                      style: const TextStyle(
                        fontSize: 13,
                        color: ColorConstants.primary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'Bạn sẽ được đăng xuất và quay lại màn hình đăng nhập.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 12,
                color: ColorConstants.textMuted,
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
        actionsPadding: const EdgeInsets.fromLTRB(24, 0, 24, 20),
        actions: [
          Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  onPressed: () => _handleClose(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ColorConstants.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: const Text(
                    'Đã hiểu',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
