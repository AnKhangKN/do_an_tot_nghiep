import 'package:flutter/material.dart';
import '../../core/constants/color_constants.dart';

class BottomNavBarWidget extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;

  const BottomNavBarWidget({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: ColorConstants.surfaceWhite,
        borderRadius: const BorderRadius.vertical(
          top: Radius.circular(28),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 25,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: const BorderRadius.vertical(
          top: Radius.circular(28),
        ),
        child: NavigationBar(
          height: 80,
          selectedIndex: currentIndex,
          onDestinationSelected: onTap,
          backgroundColor: ColorConstants.surfaceWhite,
          elevation: 0,
          indicatorColor: ColorConstants.redRescue.withOpacity(0.12),
          labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
          destinations: [
            NavigationDestination(
              icon: Icon(Icons.explore_outlined, color: ColorConstants.textSecondary),
              selectedIcon: const Icon(Icons.explore, color: ColorConstants.redRescue),
              label: 'Bản đồ',
            ),
            NavigationDestination(
              icon: Icon(Icons.assignment_outlined, color: ColorConstants.textSecondary),
              selectedIcon: const Icon(Icons.assignment, color: ColorConstants.redRescue),
              label: 'Lịch sử',
            ),
            NavigationDestination(
              icon: Icon(Icons.forum_outlined, color: ColorConstants.textSecondary),
              selectedIcon: const Icon(Icons.forum, color: ColorConstants.redRescue),
              label: 'Tin nhắn',
            ),
            NavigationDestination(
              icon: Icon(Icons.notifications_outlined, color: ColorConstants.textSecondary),
              selectedIcon: const Icon(Icons.notifications_active, color: ColorConstants.redRescue),
              label: 'Thông báo',
            ),
            NavigationDestination(
              icon: Icon(Icons.person_outline, color: ColorConstants.textSecondary),
              selectedIcon: const Icon(Icons.person, color: ColorConstants.redRescue),
              label: 'Cá nhân',
            ),
          ],
        ),
      ),
    );
  }
}
