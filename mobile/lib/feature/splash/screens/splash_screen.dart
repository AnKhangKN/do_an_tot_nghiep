import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_router_constants.dart';
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
      initApp();
    });
  }

  Future<void> initApp() async {
    final provider = context.read<SplashProvider>();

    final route = await provider.init();

    if (!mounted) return;

    switch (route) {
      case SplashRoute.login:
        context.go(RouterConstants.login);
        break;

      case SplashRoute.victim:
        context.go(RouterConstants.map);
        break;

      case SplashRoute.rescuer:
        context.go(RouterConstants.rescuerMap);
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: CircularProgressIndicator(),
      ),
    );
  }
}