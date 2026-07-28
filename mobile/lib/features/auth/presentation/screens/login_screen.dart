import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../../core/constants/color_constants.dart';
import '../../../../core/constants/router_constants.dart';
import '../providers/auth_provider.dart';
import '../widgets/guest_sos_dialog.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final emailController = TextEditingController();
  final passwordController = TextEditingController();

  @override
  void dispose() {
    emailController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    final email = emailController.text.trim();
    final password = passwordController.text.trim();
    final authProvider = context.read<AuthProvider>();

    if (email.isEmpty && password.isEmpty) {
      authProvider.setError("Vui lòng nhập đầy đủ Email và Mật khẩu!");
      return;
    }

    if (email.isEmpty) {
      authProvider.setError("Vui lòng nhập địa chỉ Email!");
      return;
    }

    if (password.isEmpty) {
      authProvider.setError("Vui lòng nhập Mật khẩu!");
      return;
    }

    final success = await authProvider.login(email, password);

    if (!success) {
      if (authProvider.requireOtp && authProvider.unverifiedEmail != null) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(authProvider.error ?? "Tài khoản chưa xác thực Email. Mã OTP mới đã được gửi!"),
            backgroundColor: Colors.orange,
          ),
        );
        context.go(RouterConstants.verifyOtp, extra: authProvider.unverifiedEmail);
      }
      return;
    }
    if (!mounted) return;

    context.go(RouterConstants.splash);
  }


  Future<void> _loginGoogle() async {
    final authProvider = context.read<AuthProvider>();
    final success = await authProvider.loginWithGoogle();

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Đăng nhập bằng Google thành công!"),
          backgroundColor: Colors.green,
        ),
      );
      context.go(RouterConstants.splash);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      backgroundColor: ColorConstants.backgroundLight,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Center(
            child: SingleChildScrollView(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Logo hoặc Icon minh họa
                  Center(
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.06),
                            blurRadius: 15,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: ClipOval(
                        child: Image.asset(
                          'assets/icon/app_icon.png',
                          width: 90,
                          height: 90,
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Tiêu đề chính
                  const Text(
                    'HỆ THỐNG CỨU HỘ',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.w900,
                      color: ColorConstants.redRescue,
                      letterSpacing: 1.2,
                    ),
                  ),
                  const Text(
                    'Đăng nhập để tiếp tục hỗ trợ',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: ColorConstants.textSecondary,
                      fontSize: 16,
                    ),
                  ),

                  const SizedBox(height: 48),

                  // Trường Email
                  TextField(
                    controller: emailController,
                    keyboardType: TextInputType.emailAddress,
                    style: const TextStyle(fontWeight: FontWeight.w600),
                    decoration: InputDecoration(
                      labelText: 'Email học tập/làm việc',
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
                      prefixIcon: const Icon(Icons.email_outlined, color: ColorConstants.redRescue),
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Trường Mật khẩu
                  TextField(
                    controller: passwordController,
                    obscureText: true,
                    style: const TextStyle(fontWeight: FontWeight.w600),
                    decoration: InputDecoration(
                      labelText: 'Mật khẩu',
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
                      prefixIcon: const Icon(Icons.lock_outline, color: ColorConstants.redRescue),
                    ),
                  ),

                  const SizedBox(height: 12),

                  // Quên mật khẩu (nếu có)
                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton(
                      onPressed: () {},
                      child: const Text(
                        'Quên mật khẩu?',
                        style: TextStyle(color: ColorConstants.textSecondary),
                      ),
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Nút Đăng nhập chính
                  SizedBox(
                    height: 56,
                    child: auth.isLoading
                        ? const Center(
                            child: CircularProgressIndicator(color: ColorConstants.redRescue),
                          )
                        : ElevatedButton(
                            onPressed: _login,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: ColorConstants.redRescue,
                              foregroundColor: Colors.white,
                              elevation: 4,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: const Text(
                              'ĐĂNG NHẬP NGAY',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                  ),

                  // Hiển thị lỗi nếu có
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

                  const SizedBox(height: 20),

                  // NÚT ĐĂNG NHẬP BẰNG GOOGLE
                  OutlinedButton.icon(
                    onPressed: _loginGoogle,
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      side: const BorderSide(color: ColorConstants.borderMuted),
                      backgroundColor: ColorConstants.surfaceWhite,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    icon: const Icon(
                      Icons.g_mobiledata_rounded,
                      size: 32,
                      color: Colors.redAccent,
                    ),
                    label: const Text(
                      'Đăng nhập bằng Google',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: ColorConstants.textPrimary,
                      ),
                    ),
                  ),

                  const SizedBox(height: 12),

                  // NÚT CỨU HỘ KHẨN CẤP DÀNH CHO GUEST (CHƯA ĐĂNG KÝ)
                  OutlinedButton.icon(
                    onPressed: () => GuestSOSDialog.show(context),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      side: const BorderSide(color: ColorConstants.dangerHigh, width: 2),
                      backgroundColor: ColorConstants.dangerHighLight,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    label: const Text(
                      'KHẨN CẤP (Chưa có tài khoản)',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        color: ColorConstants.dangerHigh,
                      ),
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Chuyển sang Đăng ký
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text("Chưa có tài khoản? "),
                      GestureDetector(
                        onTap: () => context.go(RouterConstants.register),
                        child: const Text(
                          "Đăng ký tài khoản",
                          style: TextStyle(
                            color: ColorConstants.redRescue,
                            fontWeight: FontWeight.bold,
                            decoration: TextDecoration.underline,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
