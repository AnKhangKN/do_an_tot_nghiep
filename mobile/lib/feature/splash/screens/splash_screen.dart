import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_router_constants.dart';
import '../../../core/storage/storage_service.dart';
import '../../user/providers/user_provider.dart';

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
      initApp();
    });
  }

  Future<void> initApp() async {
    final storage = context.read<StorageService>();
    final token = await storage.getAccessToken();

    if (!mounted) return;

    if (token != null) {
      try {
        final userProvider = context.read<UserProvider>();

        await context.read<UserProvider>().getProfile();

        debugPrint("ROLE = ${userProvider.role}");
        debugPrint("IS_RESCUER = ${userProvider.isRescuer}");

        if (userProvider.isRescuer) {
          debugPrint("GO RESCUER");
          context.go(RouterConstants.rescuerMap);
        } else {
          debugPrint("GO VICTIM");
          context.go(RouterConstants.map);
        }
      } catch (e) {
        context.go('/login');
      }
    } else {
      context.go('/login');
    }
  }

  @override
  Widget build(BuildContext context) {

    return Scaffold(
      body: Center(child: Text("APP CỨU HỘ")),
    );
  }
}
