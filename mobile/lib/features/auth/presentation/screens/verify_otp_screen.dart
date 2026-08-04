import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../../core/constants/color_constants.dart';
import '../../../../core/constants/router_constants.dart';
import '../../../../core/utils/app_snackbar.dart';
import '../providers/auth_provider.dart';

class VerifyOtpScreen extends StatefulWidget {
  final String email;

  const VerifyOtpScreen({
    super.key,
    required this.email,
  });

  @override
  State<VerifyOtpScreen> createState() => _VerifyOtpScreenState();
}

class _VerifyOtpScreenState extends State<VerifyOtpScreen> {
  final List<TextEditingController> _controllers = List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(6, (_) => FocusNode());

  // Đếm ngược tổng thời gian 10 phút (600 giây) hết hạn OTP
  Timer? _expirationTimer;
  int _expirationSeconds = 600; // 10 phút

  // Đếm ngược 60 giây Cooldown cho nút "Gửi lại mã OTP"
  Timer? _resendTimer;
  int _resendCooldown = 60;
  bool _canResend = false;

  @override
  void initState() {
    super.initState();
    _startExpirationTimer();
    _startResendCooldownTimer();
  }

  @override
  void dispose() {
    _expirationTimer?.cancel();
    _resendTimer?.cancel();
    for (var controller in _controllers) {
      controller.dispose();
    }
    for (var focusNode in _focusNodes) {
      focusNode.dispose();
    }
    super.dispose();
  }

  void _startExpirationTimer() {
    _expirationTimer?.cancel();
    setState(() {
      _expirationSeconds = 600; // 10 phút
    });
    _expirationTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_expirationSeconds > 0) {
        setState(() {
          _expirationSeconds--;
        });
      } else {
        timer.cancel();
      }
    });
  }

  void _startResendCooldownTimer() {
    _resendTimer?.cancel();
    setState(() {
      _resendCooldown = 60;
      _canResend = false;
    });
    _resendTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_resendCooldown > 0) {
        setState(() {
          _resendCooldown--;
        });
      } else {
        setState(() {
          _canResend = true;
        });
        timer.cancel();
      }
    });
  }

  String get _otpCode => _controllers.map((c) => c.text).join();

  String _formatTimer(int totalSeconds) {
    final minutes = totalSeconds ~/ 60;
    final seconds = totalSeconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  Future<void> _submitOtp() async {
    final code = _otpCode.trim();
    final authProvider = context.read<AuthProvider>();

    if (authProvider.isLoading) return;

    if (code.length < 6) {
      authProvider.setError("Vui lòng nhập đủ 6 chữ số mã OTP!");
      return;
    }

    if (_expirationSeconds <= 0) {
      authProvider.setError("Mã OTP đã hết hạn (quá 10 phút). Vui lòng bấm gửi lại mã mới!");
      return;
    }

    final success = await authProvider.verifyOtp(widget.email, code);

    if (!success) return;
    if (!mounted) return;

    AppSnackBar.show(
      context,
      "Xác thực Email thành công! Đang tự động đăng nhập...",
      type: AppSnackBarType.success,
    );

    // Tự động cấp Token và chuyển sang màn hình chính
    context.go(RouterConstants.splash);
  }

  Future<void> _handleResend() async {
    if (!_canResend) return;

    final authProvider = context.read<AuthProvider>();
    if (authProvider.isLoading) return;

    final success = await authProvider.resendOtp(widget.email);

    if (success && mounted) {
      AppSnackBar.show(
        context,
        "Đã gửi lại mã OTP 6 số mới tới Email!",
      );
      _startExpirationTimer();
      _startResendCooldownTimer();
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      resizeToAvoidBottomInset: true,
      backgroundColor: ColorConstants.backgroundLight,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new, color: ColorConstants.textPrimary),
          onPressed: () => context.go(RouterConstants.login),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 10),

                // Icon minh họa OTP
                Center(
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: ColorConstants.redRescue.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.mark_email_read_outlined,
                      size: 64,
                      color: ColorConstants.redRescue,
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                const Text(
                  'XÁC THỰC EMAIL',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 26,
                    fontWeight: FontWeight.w900,
                    color: ColorConstants.redRescue,
                    letterSpacing: 1.1,
                  ),
                ),
                const SizedBox(height: 8),

                Text(
                  'Mã xác thực 6 số đã được gửi tới email:\n${widget.email}',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14,
                    color: ColorConstants.textSecondary,
                    height: 1.4,
                  ),
                ),

                const SizedBox(height: 20),

                // ĐẾM NGƯỢC 10 PHÚT HẾT HẠN
                Center(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: _expirationSeconds > 0
                          ? ColorConstants.orangeWarning.withOpacity(0.1)
                          : ColorConstants.dangerLight,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: _expirationSeconds > 0
                            ? ColorConstants.orangeWarning
                            : ColorConstants.dangerBorder,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.timer_outlined,
                          size: 18,
                          color: _expirationSeconds > 0
                              ? ColorConstants.orangeWarning
                              : ColorConstants.dangerHigh,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          _expirationSeconds > 0
                              ? 'Mã hiệu lực còn: ${_formatTimer(_expirationSeconds)}'
                              : 'Mã đã hết hạn (quá 10 phút)',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: _expirationSeconds > 0
                                ? ColorConstants.orangeWarning
                                : ColorConstants.dangerHigh,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 32),

                // Ô NHẬP 6 SỐ OTP
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: List.generate(6, (index) {
                    return SizedBox(
                      width: 46,
                      height: 56,
                      child: TextField(
                        controller: _controllers[index],
                        focusNode: _focusNodes[index],
                        keyboardType: TextInputType.number,
                        textAlign: TextAlign.center,
                        maxLength: 1,
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: ColorConstants.textPrimary,
                        ),
                        decoration: InputDecoration(
                          counterText: '',
                          filled: true,
                          fillColor: ColorConstants.surfaceWhite,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(color: ColorConstants.borderMuted),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(color: ColorConstants.borderMuted),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: ColorConstants.redRescue, width: 2),
                          ),
                        ),
                        onChanged: (value) {
                          if (value.isNotEmpty) {
                            if (index < 5) {
                              _focusNodes[index + 1].requestFocus();
                            } else {
                              _focusNodes[index].unfocus();
                              _submitOtp();
                            }
                          } else {
                            if (index > 0) {
                              _focusNodes[index - 1].requestFocus();
                            }
                          }
                        },
                      ),
                    );
                  }),
                ),

                const SizedBox(height: 24),

                // NÚT XÁC THỰC
                SizedBox(
                  height: 54,
                  child: auth.isLoading
                      ? const Center(child: CircularProgressIndicator(color: ColorConstants.redRescue))
                      : ElevatedButton(
                          onPressed: _submitOtp,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: ColorConstants.redRescue,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: const Text(
                            'XÁC THỰC NGAY',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                        ),
                ),

                // HIỂN THỊ LỖI NẾU CÓ
                if (auth.error != null) ...[
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: ColorConstants.redRescue.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      auth.error!,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: ColorConstants.error,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],

                const SizedBox(height: 28),

                // NÚT GỬI LẠI MÃ VỚI COOLDOWN 60s
                Center(
                  child: TextButton.icon(
                    onPressed: _canResend ? _handleResend : null,
                    icon: const Icon(Icons.refresh_rounded, size: 20),
                    label: Text(
                      _canResend
                          ? 'Gửi lại mã OTP'
                          : 'Gửi lại mã sau (${_resendCooldown}s)',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: _canResend ? ColorConstants.redRescue : ColorConstants.textSecondary,
                      ),
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
