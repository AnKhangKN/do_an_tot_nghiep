import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/features/rescuer/presentation/providers/sos_provider.dart';
import 'package:mobile/shared/widgtes/banned_dialog_widget.dart';
import 'package:mobile/shared/widgtes/bottom_nav_bar_widget.dart';

import '../../core/di/di.dart';
import '../../core/session/session_controller.dart';
import '../../core/session/session_state.dart';

class MainShell extends StatefulWidget {
  final StatefulNavigationShell navigationShell;

  const MainShell({
    super.key,
    required this.navigationShell,
  });

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  bool _banDialogShown = false;

  @override
  void initState() {
    super.initState();
    final sessionController = getIt<SessionController>();
    sessionController.addListener(_onSessionChanged);
    getIt<SOSProvider>().addListener(_onRescueStateChanged);
  }

  @override
  void dispose() {
    getIt<SessionController>().removeListener(_onSessionChanged);
    getIt<SOSProvider>().removeListener(_onRescueStateChanged);
    super.dispose();
  }

  bool _isInRescue() {
    final session = getIt<SessionController>();
    final isRescuer = session.role == UserRole.rescuer;
    return isRescuer ? getIt<SOSProvider>().isRescuing : session.isBeingRescued;
  }

  void _onRescueStateChanged() {
    if (!_isInRescue()) return;
    if (widget.navigationShell.currentIndex != 0) {
      widget.navigationShell.goBranch(0);
    }
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

  void _onTap(int index) {
    widget.navigationShell.goBranch(index);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: false,
      body: widget.navigationShell,
      bottomNavigationBar: ListenableBuilder(
        listenable: Listenable.merge([
          getIt<SessionController>(),
          getIt<SOSProvider>(),
        ]),
        builder: (context, _) {
          if (_isInRescue()) {
            return const SizedBox.shrink();
          }
          return RepaintBoundary(
            child: BottomNavBarWidget(
              currentIndex: widget.navigationShell.currentIndex,
              onTap: _onTap,
            ),
          );
        },
      ),
    );
  }
}
