import 'package:dio/dio.dart' as dio_package;
import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';
import 'package:mobile/core/session/session_controller.dart';
import 'package:mobile/core/storage/storage_service.dart';
import '../../core/constants/color_constants.dart';
import '../../core/utils/app_snackbar.dart';
import '../../features/auth/data/auth_repository.dart';

class BannedDialogWidget extends StatelessWidget {
  final String? reason;

  const BannedDialogWidget({super.key, this.reason});

  static void show(BuildContext context, {String? reason}) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => BannedDialogWidget(reason: reason),
    );
  }

  void _handleLogout(BuildContext context) {
    GetIt.instance<StorageService>().clearAll();
    GetIt.instance<SessionController>().dismissBan();
    GetIt.instance<SessionController>().setLoggedIn(false);
    Navigator.of(context).pop();
  }

  void _handleAppeal(BuildContext context) {
    Navigator.of(context).pop();
    _showAppealDialog(context);
  }

  void _showAppealDialog(BuildContext parentContext) {
    final reasonController = TextEditingController();
    final emailController = TextEditingController();
    final formKey = GlobalKey<FormState>();
    ValueNotifier<String?> errorNotifier = ValueNotifier(null);
    ValueNotifier<bool> submitting = ValueNotifier(false);

    showDialog(
      context: parentContext,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
        ),
        contentPadding: const EdgeInsets.fromLTRB(24, 28, 24, 12),
        content: SingleChildScrollView(
          child: Form(
          key: formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: ColorConstants.primary.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.mail_outline_rounded,
                  size: 36,
                  color: ColorConstants.primary,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Gửi yêu cầu kháng cáo',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: ColorConstants.slateDark,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Nhập email đã đăng ký và lý do kháng cáo. Admin sẽ xem xét và phản hồi sớm nhất.',
                style: TextStyle(
                  fontSize: 13,
                  color: ColorConstants.textMuted,
                ),
              ),
              const SizedBox(height: 12),
              ValueListenableBuilder<String?>(
                valueListenable: errorNotifier,
                builder: (_, msg, __) => msg != null
                    ? Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        margin: const EdgeInsets.only(bottom: 12),
                        decoration: BoxDecoration(
                          color: ColorConstants.error.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: ColorConstants.error.withValues(alpha: 0.3)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.error_outline, size: 18, color: ColorConstants.error),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                msg,
                                style: const TextStyle(
                                  fontSize: 13,
                                  color: ColorConstants.error,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                          ],
                        ),
                      )
                    : const SizedBox.shrink(),
              ),
              TextFormField(
                controller: emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: InputDecoration(
                  hintText: 'Email đã đăng ký',
                  hintStyle: TextStyle(
                    fontSize: 14,
                    color: ColorConstants.textMuted,
                  ),
                  prefixIcon: const Icon(Icons.email_outlined, size: 20),
                  filled: true,
                  fillColor: ColorConstants.bgCanvas,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(
                      color: ColorConstants.primary,
                      width: 1.5,
                    ),
                  ),
                  contentPadding: const EdgeInsets.all(14),
                ),
                validator: (v) {
                  if (v == null || v.trim().isEmpty) return 'Vui lòng nhập email';
                  if (!RegExp(r'^[^@]+@[^@]+\.[^@]+$').hasMatch(v.trim())) return 'Email không hợp lệ';
                  return null;
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: reasonController,
                maxLines: 4,
                maxLength: 500,
                decoration: InputDecoration(
                  hintText: 'Nhập lý do kháng cáo...',
                  hintStyle: TextStyle(
                    fontSize: 14,
                    color: ColorConstants.textMuted,
                  ),
                  filled: true,
                  fillColor: ColorConstants.bgCanvas,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(
                      color: ColorConstants.primary,
                      width: 1.5,
                    ),
                  ),
                  contentPadding: const EdgeInsets.all(14),
                ),
                validator: (v) {
                  if (v == null || v.trim().isEmpty) return 'Vui lòng nhập lý do';
                  return null;
                },
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
        ),
        actionsPadding: const EdgeInsets.fromLTRB(24, 0, 24, 20),
        actions: [
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () {
                    Navigator.of(ctx).pop();
                    BannedDialogWidget.show(
                      parentContext,
                      reason: GetIt.instance<SessionController>().banReason,
                    );
                  },
                  style: OutlinedButton.styleFrom(
                    foregroundColor: ColorConstants.slateDark,
                    side: BorderSide(color: ColorConstants.border),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: const Text(
                    'Hủy',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ValueListenableBuilder<bool>(
                  valueListenable: submitting,
                  builder: (_, isSubmitting, __) => ElevatedButton(
                    onPressed: isSubmitting
                        ? null
                        : () async {
                            if (!(formKey.currentState?.validate() ?? false)) return;
                            final email = emailController.text.trim();
                            final reason = reasonController.text.trim();

                            submitting.value = true;
                            errorNotifier.value = null;

                            try {
                              await GetIt.instance<AuthRepository>().appealBan(email: email, reason: reason);
                              Navigator.of(ctx).pop();
                              if (parentContext.mounted) {
                                AppSnackBar.show(
                                  parentContext,
                                  'Đã gửi yêu cầu kháng cáo thành công!',
                                  type: AppSnackBarType.success,
                                );
                              }
                              _handleLogout(parentContext);
                            } catch (e) {
                              submitting.value = false;
                              String errorMsg = 'Gửi kháng cáo thất bại. Vui lòng thử lại sau.';
                              if (e is dio_package.DioException && e.response?.data != null && e.response?.data['message'] != null) {
                                errorMsg = e.response!.data['message'].toString();
                              } else if (e.toString().contains('khóa vĩnh viễn')) {
                                errorMsg = 'Tài khoản của bạn đã bị khóa vĩnh viễn do bị từ chối kháng cáo 3 lần vì vi phạm chính sách ứng dụng.';
                              } else if (e.toString().contains('3 yêu cầu')) {
                                errorMsg = 'Bạn đã có 3 yêu cầu kháng cáo đang chờ xử lý. Vui lòng chờ Ban quản trị xét duyệt trước khi gửi thêm.';
                              }
                              errorNotifier.value = errorMsg;
                            }
                          },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: ColorConstants.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    child: isSubmitting
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : const Text(
                            'Gửi',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                          ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
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
                color: ColorConstants.danger.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.lock_rounded,
                size: 36,
                color: ColorConstants.danger,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Tài khoản đã bị khóa',
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
                color: ColorConstants.danger.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: ColorConstants.danger.withValues(alpha: 0.2),
                ),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(
                    Icons.warning_amber_rounded,
                    size: 18,
                    color: ColorConstants.danger,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      reason ?? 'Tài khoản của bạn đã bị Admin khóa do vi phạm chính sách hệ thống.',
                      style: const TextStyle(
                        fontSize: 13,
                        color: ColorConstants.danger,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'Bạn không thể tiếp tục sử dụng ứng dụng cho đến khi tài khoản được mở khóa.',
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
                child: OutlinedButton(
                  onPressed: () => _handleAppeal(context),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: ColorConstants.primary,
                    side: const BorderSide(color: ColorConstants.primary),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: const Text(
                    'Kháng cáo',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: () => _handleLogout(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ColorConstants.slateDark,
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
