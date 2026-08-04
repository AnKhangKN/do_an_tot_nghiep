import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../../core/constants/color_constants.dart';
import '../../../../core/constants/router_constants.dart';
import '../../../../core/di/di.dart';
import '../../../../core/session/session_controller.dart';
import '../../../../core/utils/app_snackbar.dart';
import '../../../../shared/widgtes/banned_dialog_widget.dart';
import '../../../../shared/widgtes/kicked_dialog_widget.dart';
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
  bool _obscurePassword = true;
  bool _banDialogShown = false;
  bool _kickedDialogShown = false;

  @override
  void initState() {
    super.initState();
    _checkBanState();
    _checkKickedMessage();
    getIt<SessionController>().addListener(_onSessionChanged);
  }

  @override
  void dispose() {
    getIt<SessionController>().removeListener(_onSessionChanged);
    emailController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  void _onSessionChanged() {
    _onBanStateChanged();
    _onKickedStateChanged();
  }

  void _onKickedStateChanged() {
    final controller = getIt<SessionController>();
    final message = controller.kickedMessage;
    if (message != null && !_kickedDialogShown && mounted) {
      _kickedDialogShown = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (_) => KickedDialogWidget(message: message),
        ).then((_) => _kickedDialogShown = false);
      });
    }
  }

  void _checkKickedMessage() {
    final controller = getIt<SessionController>();
    final message = controller.kickedMessage;
    if (message != null && mounted) {
      _kickedDialogShown = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (_) => KickedDialogWidget(message: message),
        ).then((_) => _kickedDialogShown = false);
      });
    }
  }

  void _onBanStateChanged() {
    final controller = getIt<SessionController>();
    if (controller.isBanned && !_banDialogShown && mounted) {
      _banDialogShown = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (_) => BannedDialogWidget(reason: controller.banReason),
        ).then((_) => _banDialogShown = false);
      });
    }
  }

  void _checkBanState() {
    final controller = getIt<SessionController>();
    if (controller.isBanned && mounted) {
      _banDialogShown = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (_) => BannedDialogWidget(reason: controller.banReason),
        ).then((_) => _banDialogShown = false);
      });
    }
  }

  Future<void> _login() async {
    final email = emailController.text.trim();
    final password = passwordController.text;
    final authProvider = context.read<AuthProvider>();

    if (authProvider.isLoading) return;

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
        AppSnackBar.show(
          context,
          authProvider.error ?? "Tài khoản chưa xác thực Email. Mã OTP mới đã được gửi!",
          type: AppSnackBarType.warning,
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
    if (authProvider.isLoading) return;

    final success = await authProvider.loginWithGoogle();

    if (success && mounted) {
      AppSnackBar.show(
        context,
        "Đăng nhập bằng Google thành công!",
        type: AppSnackBarType.success,
      );
      context.go(RouterConstants.splash);
    }
  }

  InputDecoration _inputDecoration(String label, IconData icon) {
    return InputDecoration(
      labelText: label,
      labelStyle: TextStyle(color: ColorConstants.textSecondary, fontWeight: FontWeight.w500),
      filled: true,
      fillColor: ColorConstants.bgCanvas,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: BorderSide.none,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: BorderSide(color: ColorConstants.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: ColorConstants.redRescue, width: 1.5),
      ),
      prefixIcon: Icon(icon, color: ColorConstants.redRescue, size: 22),
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      resizeToAvoidBottomInset: false,
      backgroundColor: ColorConstants.backgroundLight,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: [
              // Decorative header
              Container(
                width: double.infinity,
                padding: const EdgeInsets.only(top: 40, bottom: 32),
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      ColorConstants.redRescue,
                      Color(0xFFC62828),
                    ],
                  ),
                  borderRadius: BorderRadius.only(
                    bottomLeft: Radius.circular(32),
                    bottomRight: Radius.circular(32),
                  ),
                ),
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.15),
                            blurRadius: 20,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: ClipOval(
                        child: Image.asset(
                          'assets/icon/app_icon.png',
                          width: 80,
                          height: 80,
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'HỆ THỐNG CỨU HỘ',
                      style: TextStyle(
                        fontSize: 26,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                        letterSpacing: 1.5,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Đăng nhập để tiếp tục',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.9),
                        fontSize: 15,
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                  ],
                ),
              ),

              Padding(
                padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const SizedBox(height: 28),

                    // Error banner
                    if (auth.error != null)
                      Container(
                        margin: const EdgeInsets.only(bottom: 20),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        decoration: BoxDecoration(
                          color: ColorConstants.dangerLight,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: ColorConstants.dangerBorder),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.warning_amber_rounded, color: ColorConstants.dangerText, size: 22),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                auth.error!,
                                style: const TextStyle(
                                  color: ColorConstants.dangerText,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                    // Email
                    TextField(
                      controller: emailController,
                      keyboardType: TextInputType.emailAddress,
                      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
                      decoration: _inputDecoration('Email', Icons.email_outlined),
                    ),

                    const SizedBox(height: 16),

                    // Password
                    TextField(
                      controller: passwordController,
                      obscureText: _obscurePassword,
                      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
                      decoration: _inputDecoration('Mật khẩu', Icons.lock_outline).copyWith(
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                            color: ColorConstants.textSecondary,
                            size: 22,
                          ),
                          onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                        ),
                      ),
                    ),

                    const SizedBox(height: 4),

                    // Forgot password
                    Align(
                      alignment: Alignment.centerRight,
                      child: TextButton(
                        onPressed: () => context.go(RouterConstants.forgotPassword),
                        style: TextButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                          foregroundColor: ColorConstants.textSecondary,
                        ),
                        child: const Text(
                          'Quên mật khẩu?',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: ColorConstants.redRescue,
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 8),

                    // Login button
                    SizedBox(
                      height: 54,
                      child: auth.isLoading
                          ? const Center(
                              child: CircularProgressIndicator(color: ColorConstants.redRescue),
                            )
                          : Container(
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(16),
                                boxShadow: [
                                  BoxShadow(
                                    color: ColorConstants.redRescue.withOpacity(0.3),
                                    blurRadius: 12,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                              ),
                              child: ElevatedButton(
                                onPressed: _login,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: ColorConstants.redRescue,
                                  foregroundColor: Colors.white,
                                  elevation: 0,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                ),
                                child: const Text(
                                  'ĐĂNG NHẬP',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 1,
                                  ),
                                ),
                              ),
                            ),
                    ),

                    const SizedBox(height: 24),

                    // Divider
                    Row(
                      children: [
                        Expanded(child: Divider(color: ColorConstants.border)),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Text(
                            'HOẶC',
                            style: TextStyle(
                              color: ColorConstants.textMuted,
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 1,
                            ),
                          ),
                        ),
                        Expanded(child: Divider(color: ColorConstants.border)),
                      ],
                    ),

                    const SizedBox(height: 24),

                    // Google button
                    OutlinedButton.icon(
                      onPressed: auth.isLoading ? null : _loginGoogle,
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        side: BorderSide(color: ColorConstants.border),
                        backgroundColor: ColorConstants.surfaceWhite,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        elevation: 0,
                      ),
                      icon: const Icon(
                        Icons.g_mobiledata_rounded,
                        size: 28,
                        color: Colors.redAccent,
                      ),
                      label: Text(
                        'Đăng nhập với Google',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: ColorConstants.textPrimary,
                        ),
                      ),
                    ),

                    const SizedBox(height: 14),

                    // SOS Guest button
                    OutlinedButton.icon(
                      onPressed: () => GuestSOSDialog.show(context),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        side: const BorderSide(color: ColorConstants.dangerHigh, width: 1.5),
                        backgroundColor: ColorConstants.dangerHighLight,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      icon: const Icon(Icons.warning_amber_rounded, color: ColorConstants.dangerHigh, size: 22),
                      label: const Text(
                        'KHẨN CẤP (Chưa có tài khoản)',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          color: ColorConstants.dangerHigh,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),

                    const SizedBox(height: 28),

                    // Register link
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          "Chưa có tài khoản? ",
                          style: TextStyle(
                            color: ColorConstants.textMuted,
                            fontSize: 14,
                          ),
                        ),
                        GestureDetector(
                          onTap: () => context.go(RouterConstants.register),
                          child: Text(
                            "Đăng ký ngay",
                            style: TextStyle(
                              color: ColorConstants.redRescue,
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                              decoration: TextDecoration.underline,
                              decorationColor: ColorConstants.redRescue,
                            ),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
