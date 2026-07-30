import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/shared/widgtes/banned_dialog_widget.dart';
import 'package:mobile/shared/widgtes/bottom_nav_bar_widget.dart';

import '../../core/di/di.dart';
import '../../core/session/app_session.dart';
import '../../core/session/session_controller.dart';

class MainShell extends StatefulWidget {
  final Widget child;

  const MainShell({
    super.key,
    required this.child,
  });

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  final List<String> _baseRoutes = [
    '/map',
    '/history',
    '/chat',
    '/notifications',
    '/profile',
  ];

  bool _banDialogShown = false;

  @override
  void initState() {
    super.initState();
    final sessionController = getIt<SessionController>();
    sessionController.addListener(_onSessionChanged);
  }

  @override
  void dispose() {
    getIt<SessionController>().removeListener(_onSessionChanged);
    super.dispose();
  }

  void _onSessionChanged() {
    final controller = getIt<SessionController>();
    if (controller.isBanned && !_banDialogShown && mounted) {
      _banDialogShown = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        BannedDialogWidget.show(
          context,
          reason: controller.banReason,
        );
      });
    } else if (!controller.isBanned) {
      _banDialogShown = false;
    }
  }

  int _calculateCurrentIndex(String location) {
    if (location == '/rescuer-map' || location == '/map') {
      return 0;
    }

    final index = _baseRoutes.indexOf(location);

    return index != -1 ? index : 0;
  }

  void _onTap(BuildContext context, int index) {
    if (index == 0) {
      final isRescuer = getIt<AppSession>().isRescuer;

      context.go(
        isRescuer ? '/rescuer-map' : '/map',
      );
      return;
    }

    context.go(_baseRoutes[index]);
  }

  @override
  Widget build(BuildContext context) {
    final currentLocation =
        GoRouterState.of(context).matchedLocation;

    final currentIndex =
    _calculateCurrentIndex(currentLocation);

    return Scaffold(
      body: widget.child,
      bottomNavigationBar: BottomNavBarWidget(
        currentIndex: currentIndex,
        onTap: (index) => _onTap(context, index),
      ),
    );
  }
}