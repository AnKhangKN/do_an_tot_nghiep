import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../../core/constants/color_constants.dart';
import '../../../../core/constants/router_constants.dart';
import '../providers/auth_provider.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  final confirmPasswordController = TextEditingController();

  bool isLoading = false;

  Future<void> register() async {
    final email = emailController.text.trim();
    final password = passwordController.text.trim();
    final confirmPassword = confirmPasswordController.text.trim();

    if (email.isEmpty || password.isEmpty || confirmPassword.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Vui lòng nhập đầy đủ thông tin"),
        ),
      );
      return;
    }

    if (password != confirmPassword) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Mật khẩu xác nhận không khớp"),
        ),
      );
      return;
    }

    final authProvider = context.read<AuthProvider>();

    setState(() {
      isLoading = true;
    });

    final success = await authProvider.register(email, password, confirmPassword);

    if (!mounted) return;

    setState(() {
      isLoading = false;
    });

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: Colors.green,
          content: Text("Đã gửi mã xác thực OTP 6 số tới Email của bạn!"),
        ),
      );
      context.go(RouterConstants.verifyOtp, extra: email);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: Colors.red,
          content: Text(
            authProvider.error ?? "Đăng ký thất bại. Vui lòng thử lại!",
          ),
        ),
      );
    }
  }

  InputDecoration inputDecoration(
    String label,
    IconData icon,
  ) {
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

  @override
  void dispose() {
    emailController.dispose();
    passwordController.dispose();
    confirmPasswordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ColorConstants.backgroundLight,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: ColorConstants.textPrimary),
          onPressed: () => context.go(RouterConstants.login),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Center(
            child: SingleChildScrollView(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
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
                  const Text(
                    'ĐĂNG KÝ TÀI KHOẢN',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.w900,
                      color: ColorConstants.redRescue,
                      letterSpacing: 1.2,
                    ),
                  ),
                  const Text(
                    'Đăng ký để tham gia hệ thống cứu hộ',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: ColorConstants.textSecondary,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 40),
                  TextField(
                    controller: emailController,
                    keyboardType: TextInputType.emailAddress,
                    style: const TextStyle(fontWeight: FontWeight.w600),
                    decoration: inputDecoration(
                      "Email học tập/làm việc",
                      Icons.email_outlined,
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: passwordController,
                    obscureText: true,
                    style: const TextStyle(fontWeight: FontWeight.w600),
                    decoration: inputDecoration(
                      "Mật khẩu",
                      Icons.lock_outline,
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: confirmPasswordController,
                    obscureText: true,
                    style: const TextStyle(fontWeight: FontWeight.w600),
                    decoration: inputDecoration(
                      "Xác nhận mật khẩu",
                      Icons.lock_reset_outlined,
                    ),
                  ),
                  const SizedBox(height: 32),
                  SizedBox(
                    height: 56,
                    child: isLoading
                        ? const Center(
                            child: CircularProgressIndicator(color: ColorConstants.redRescue),
                          )
                        : ElevatedButton(
                            onPressed: register,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: ColorConstants.redRescue,
                              foregroundColor: Colors.white,
                              elevation: 4,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: const Text(
                              'ĐĂNG KÝ NGAY',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                  ),
                  const SizedBox(height: 32),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text("Đã có tài khoản? "),
                      GestureDetector(
                        onTap: () => context.go(RouterConstants.login),
                        child: const Text(
                          "Đăng nhập",
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