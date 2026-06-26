import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/core/constants/app_router_constants.dart';
import 'package:mobile/feature/splash/providers/splash_provider.dart';
import 'package:provider/provider.dart';

class BottomNavBarWidget extends StatelessWidget {
  final Widget child;

  const BottomNavBarWidget({super.key, required this.child});

  int _getSelectIndex(BuildContext context) {
    final String location = GoRouterState.of(context).uri.toString();

    if (location.startsWith(RouterConstants.map)) return 0;
    if (location.startsWith(RouterConstants.rescuerMap)) return 0;

    if (location.startsWith(RouterConstants.notification)) return 1;
    if (location.startsWith(RouterConstants.messages)) return 2;
    if (location.startsWith(RouterConstants.history)) return 3;
    if (location.startsWith(RouterConstants.profile)) return 4;

    return 0;
  }

  void _onItemTapped(BuildContext context, int index) {
    final splashProvider = context.read<SplashProvider>();

    switch (index) {
      case 0:
        if (splashProvider.isRescuer) {
          context.go(RouterConstants.rescuerMap);
        } else {
          context.go(RouterConstants.map);
        }
        break;

      case 1:
        context.go(RouterConstants.notification);
        break;

      case 2:
        context.go(RouterConstants.messages);
        break;

      case 3:
        context.go(RouterConstants.history);
        break;

      case 4:
        context.go(RouterConstants.profile);
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final selectedIndex = _getSelectIndex(context);

    return Scaffold(
      extendBody: true,
      backgroundColor: const Color(0xFFF4F7FC),

      body: SafeArea(bottom: false, child: child),

      bottomNavigationBar: Container(
        height: 110,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.08),
              blurRadius: 20,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(24),
          child: BottomNavigationBar(
            currentIndex: selectedIndex,
            onTap: (index) => _onItemTapped(context, index),

            type: BottomNavigationBarType.fixed,
            backgroundColor: Colors.white,

            elevation: 0,

            selectedItemColor: const Color(0xFFD32F2F),
            unselectedItemColor: Colors.grey.shade500,

            selectedFontSize: 12,
            unselectedFontSize: 11,

            selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold),

            items: [
              BottomNavigationBarItem(
                icon: _buildIcon(
                  icon: Icons.map_rounded,
                  active: selectedIndex == 0,
                ),
                label: 'Bản đồ',
              ),

              BottomNavigationBarItem(
                icon: _buildIcon(
                  icon: Icons.notifications_active_rounded,
                  active: selectedIndex == 1,
                  showBadge: true,
                ),
                label: 'Thông báo',
              ),

              BottomNavigationBarItem(
                icon: _buildIcon(
                  icon: Icons.chat_bubble_rounded,
                  active: selectedIndex == 2,
                ),
                label: 'Tin nhắn',
              ),

              BottomNavigationBarItem(
                icon: _buildIcon(
                  icon: Icons.history_rounded,
                  active: selectedIndex == 3,
                ),
                label: 'Lịch sử',
              ),

              BottomNavigationBarItem(
                icon: _buildIcon(
                  icon: Icons.person_rounded,
                  active: selectedIndex == 4,
                ),
                label: 'Cá nhân',
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildIcon({
    required IconData icon,
    required bool active,
    bool showBadge = false,
  }) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        AnimatedContainer(
          duration: const Duration(milliseconds: 250),
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: active
                ? const Color(0xFFD32F2F).withOpacity(0.12)
                : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
          ),

          child: Icon(icon, size: 26),
        ),

        if (showBadge)
          Positioned(
            right: -2,
            top: -2,
            child: Container(
              width: 10,
              height: 10,
              decoration: BoxDecoration(
                color: Colors.green,
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 2),
              ),
            ),
          ),
      ],
    );
  }
}
