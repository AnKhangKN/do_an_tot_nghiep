import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class BottomNavBarWidget extends StatelessWidget {
  final Widget child;

  const BottomNavBarWidget({super.key, required this.child});

  int _getSelectIndex(BuildContext context) {
    final String location = GoRouterState.of(context).uri.toString();

    if (location.startsWith('/notifications')) return 1;
    if (location.startsWith('/messages')) return 2;
    if (location.startsWith('/history')) return 3;
    if (location.startsWith('/profile')) return 4;

    return 0;
  }

  void _onItemTapped (BuildContext context, int index) {
    switch(index) {
      case 0:
        context.go('/map');
        break;
        
      case 1:
        context.go('/notifications');
        break;
        
      case 2:
        context.go('/messages');
        break;
        
      case 3:
        context.go('/history');
        break;

      case 4:
        context.go('/profile');
        break;
    }
  }


  @override
  Widget build(BuildContext context) {
    final selectedIndex = _getSelectIndex(context);


    return Scaffold(
      body: SafeArea(child: child),

      bottomNavigationBar: BottomNavigationBar(
        currentIndex: selectedIndex,
        onTap: (index) => _onItemTapped(context, index),

        type: BottomNavigationBarType.fixed,
        elevation: 0,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.map),
            label: 'Map'
          ),

          BottomNavigationBarItem(
              icon: Icon(Icons.notifications),
              label: 'Thông báo'
          ),

          BottomNavigationBarItem(
              icon: Icon(Icons.message),
              label: 'Tin nhắn'
          ),

          BottomNavigationBarItem(
              icon: Icon(Icons.history),
              label: 'Lịch sử'
          ),

          BottomNavigationBarItem(
              icon: Icon(Icons.person),
              label: 'Cá nhân'
          ),


        ],
      ),
    );
  }
}
