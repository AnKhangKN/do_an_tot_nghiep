import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../../core/constants/color_constants.dart';
import '../../../../core/constants/router_constants.dart';
import '../providers/auth_provider.dart';

enum _ForgotStep { email, otp, reset, done }

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  _ForgotStep _step = _ForgotStep.email;

  final emailController = TextEditingController();
  final otpController = TextEditingController();
  final passwordController = TextEditingController();
  final confirmPasswordController = TextEditingController();

  bool _obscurePassword = true;
  bool _obscureConfirm = true;

  @override
  void dispose() {
    emailController.dispose();
    otpController.dispose();
    passwordController.dispose();
    confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _sendOtp() async {
    final email = emailController.text.trim();
    if (email.isEmpty) return;

    final auth = context.read<AuthProvider>();
    final success = await auth.forgotPassword(email);

    if (!mounted) return;

    if (success) {
      setState(() => _step = _ForgotStep.otp);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(auth.error ?? "Gửi yêu cầu thất bại!"),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _verifyOtp() {
    final otp = otpController.text.trim();
    if (otp.length != 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Mã OTP phải đúng 6 chữ số!"),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }
    setState(() => _step = _ForgotStep.reset);
  }

  Future<void> _resetPassword() async {
    final email = emailController.text.trim();
    final otp = otpController.text.trim();
    final password = passwordController.text;
    final confirm = confirmPasswordController.text;

    if (password.length < 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Mật khẩu phải ít nhất 6 ký tự!"),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    if (password != confirm) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Mật khẩu xác nhận không khớp!"),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    final auth = context.read<AuthProvider>();
    final success = await auth.resetPassword(
      email: email,
      otpCode: otp,
      newPassword: password,
      confirmPassword: confirm,
    );

    if (!mounted) return;

    if (success) {
      setState(() => _step = _ForgotStep.done);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(auth.error ?? "Đặt lại mật khẩu thất bại!"),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  InputDecoration _inputDecoration(String label, IconData icon) {
    return InputDecoration(
      labelText: label,
      labelStyle: const TextStyle(color: ColorConstants.textSecondary),
      filled: true,
      fillColor: ColorConstants.surfaceWhite,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide.none,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Colors.transparent),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: ColorConstants.redRescue, width: 2),
      ),
      prefixIcon: Icon(icon, color: ColorConstants.redRescue),
    );
  }

  Widget _buildStepIndicator() {
    const steps = [_ForgotStep.email, _ForgotStep.otp, _ForgotStep.reset];
    final currentIndex = steps.indexOf(_step);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: List.generate(steps.length * 2 - 1, (i) {
          if (i.isOdd) {
            return Container(
              width: 32,
              height: 2,
              color: i ~/ 2 < currentIndex
                  ? ColorConstants.redRescue
                  : ColorConstants.borderMuted,
            );
          }
          final stepIndex = i ~/ 2;
          final isActive = stepIndex <= currentIndex;
          return Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: isActive ? ColorConstants.redRescue : ColorConstants.borderMuted,
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                '${stepIndex + 1}',
                style: TextStyle(
                  color: isActive ? Colors.white : ColorConstants.textSecondary,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            ),
          );
        }),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      backgroundColor: ColorConstants.backgroundLight,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: ColorConstants.textPrimary),
          onPressed: _step == _ForgotStep.email
              ? () => context.go(RouterConstants.login)
              : () => setState(() {
                    if (_step == _ForgotStep.otp) {
                      _step = _ForgotStep.email;
                    } else if (_step == _ForgotStep.reset) {
                      _step = _ForgotStep.otp;
                    } else {
                      _step = _ForgotStep.email;
                    }
                  }),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 16),
                const Icon(Icons.lock_reset_rounded, size: 64, color: ColorConstants.redRescue),
                const SizedBox(height: 16),
                Text(
                  _step == _ForgotStep.email
                      ? "Quên mật khẩu"
                      : _step == _ForgotStep.otp
                          ? "Xác thực OTP"
                          : _step == _ForgotStep.reset
                              ? "Mật khẩu mới"
                              : "Hoàn tất",
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w900,
                    color: ColorConstants.redRescue,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  _step == _ForgotStep.email
                      ? "Nhập email để nhận mã OTP đặt lại mật khẩu"
                      : _step == _ForgotStep.otp
                          ? "Nhập mã OTP 6 số đã gửi đến email của bạn"
                          : _step == _ForgotStep.reset
                              ? "Nhập mật khẩu mới"
                              : "Mật khẩu đã được cập nhật thành công!",
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: ColorConstants.textSecondary, fontSize: 14),
                ),
                const SizedBox(height: 16),
                _buildStepIndicator(),
                const SizedBox(height: 24),

                if (_step == _ForgotStep.email) ...[
                  TextField(
                    controller: emailController,
                    keyboardType: TextInputType.emailAddress,
                    style: const TextStyle(fontWeight: FontWeight.w600),
                    decoration: _inputDecoration("Email", Icons.email_outlined),
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    height: 52,
                    child: auth.isLoading
                        ? const Center(child: CircularProgressIndicator(color: ColorConstants.redRescue))
                        : ElevatedButton(
                            onPressed: _sendOtp,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: ColorConstants.redRescue,
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            child: const Text("GỬI MÃ OTP", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                          ),
                  ),
                ],

                if (_step == _ForgotStep.otp) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: ColorConstants.redRescue.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      "Mã OTP đã gửi đến ${emailController.text.trim()}",
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: ColorConstants.textPrimary, fontWeight: FontWeight.w500),
                    ),
                  ),
                  const SizedBox(height: 20),
                  TextField(
                    controller: otpController,
                    keyboardType: TextInputType.number,
                    maxLength: 6,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, letterSpacing: 8),
                    decoration: const InputDecoration(
                      counterText: '',
                      hintText: '------',
                      hintStyle: TextStyle(letterSpacing: 8, color: ColorConstants.borderMuted),
                      filled: true,
                      fillColor: ColorConstants.surfaceWhite,
                      border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(12)), borderSide: BorderSide.none),
                    ),
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    height: 52,
                    child: ElevatedButton(
                      onPressed: _verifyOtp,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: ColorConstants.redRescue,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text("XÁC THỰC OTP", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],

                if (_step == _ForgotStep.reset) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.green.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text(
                      "Xác thực OTP thành công! Nhập mật khẩu mới.",
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.green, fontWeight: FontWeight.w500),
                    ),
                  ),
                  const SizedBox(height: 20),
                  TextField(
                    controller: passwordController,
                    obscureText: _obscurePassword,
                    style: const TextStyle(fontWeight: FontWeight.w600),
                    decoration: _inputDecoration("Mật khẩu mới", Icons.lock_outline).copyWith(
                      suffixIcon: IconButton(
                        icon: Icon(_obscurePassword ? Icons.visibility_off : Icons.visibility, color: ColorConstants.textSecondary),
                        onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: confirmPasswordController,
                    obscureText: _obscureConfirm,
                    style: const TextStyle(fontWeight: FontWeight.w600),
                    decoration: _inputDecoration("Xác nhận mật khẩu", Icons.lock_reset_outlined).copyWith(
                      suffixIcon: IconButton(
                        icon: Icon(_obscureConfirm ? Icons.visibility_off : Icons.visibility, color: ColorConstants.textSecondary),
                        onPressed: () => setState(() => _obscureConfirm = !_obscureConfirm),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    height: 52,
                    child: auth.isLoading
                        ? const Center(child: CircularProgressIndicator(color: ColorConstants.redRescue))
                        : ElevatedButton(
                            onPressed: _resetPassword,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: ColorConstants.redRescue,
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            child: const Text("ĐẶT LẠI MẬT KHẨU", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                          ),
                  ),
                ],

                if (_step == _ForgotStep.done) ...[
                  const Icon(Icons.check_circle_outline, size: 80, color: Colors.green),
                  const SizedBox(height: 24),
                  SizedBox(
                    height: 52,
                    child: ElevatedButton(
                      onPressed: () => context.go(RouterConstants.login),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: ColorConstants.redRescue,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text("ĐĂNG NHẬP NGAY", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],

                if (_step != _ForgotStep.done) ...[
                  const SizedBox(height: 16),
                  TextButton(
                    onPressed: () => context.go(RouterConstants.login),
                    child: const Text("Quay lại đăng nhập", style: TextStyle(color: ColorConstants.textSecondary)),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
