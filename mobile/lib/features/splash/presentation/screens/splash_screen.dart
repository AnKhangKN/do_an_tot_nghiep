import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../core/constants/color_constants.dart';
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

    // Mặc định luôn hiển thị Loading (Nền + Vòng xoay)
    // thay vì trả về SizedBox.shrink() gây đen màn hình.
    return Scaffold(
      backgroundColor: ColorConstants.surfaceWhite,
      body: const Center(child: CircularProgressIndicator()),
    );
  }
}
