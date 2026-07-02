import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/features/auth/data/auth_repository.dart';
import 'package:provider/provider.dart';
import '../../../../core/constants/router_constants.dart';
import '../../../../core/session/app_session.dart';
import '../../../../core/session/session_state.dart';
import '../providers/splash_provider.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<SplashProvider>().initApp();
    });
  }

  @override
  Widget build(BuildContext context) {
    final splashProvider = context.watch<SplashProvider>();

    // Nếu có lỗi mạng nghiêm trọng
    if (splashProvider.error != null) {
      return Scaffold(
        body: Center(child: Text('Lỗi khởi tạo: ${splashProvider.error}')),
      );
    }

    // Mặc định luôn hiển thị Loading (Nền trắng + Vòng xoay)
    // thay vì trả về SizedBox.shrink() gây đen màn hình.
    return const Scaffold(
      backgroundColor: Colors.white, // Hoặc màu nền App của bạn
      body: Center(child: CircularProgressIndicator()),
    );
  }
}
