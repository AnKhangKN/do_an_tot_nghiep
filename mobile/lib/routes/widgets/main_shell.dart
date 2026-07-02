import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/di/di.dart'; // Import đúng đường dẫn getIt của bạn
import '../../core/session/app_session.dart'; // Import đúng đường dẫn AppSession của bạn

class MainShell extends StatefulWidget {
  final Widget child;

  const MainShell({super.key, required this.child});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  // Không dùng biến cục bộ _index cố định nữa, chúng ta sẽ tính toán trực tiếp dựa vào URL thực tế

  // Danh sách các route khớp với 5 nút của BottomNavigationBar
  final List<String> _baseRoutes = [
    '/map',           // Vị trí 0 (Dành cho Victim)
    '/history',       // Vị trí 1
    '/chat',          // Vị trí 2
    '/notifications', // Vị trí 3
    '/profile',       // Vị trí 4
  ];

  int _calculateCurrentIndex(String location) {
    // Nếu đang ở màn hình map của Rescuer, vẫn tính là đang active Tab số 0 (Map)
    if (location == '/rescuer-map' || location == '/map') {
      return 0;
    }

    // Tìm vị trí của các tab còn lại
    final index = _baseRoutes.indexOf(location);
    return index != -1 ? index : 0;
  }

  void _onTap(BuildContext context, int index) {
    if (index == 0) {
      // Kiểm tra quyền từ AppSession để đẩy đi đúng nhánh Map
      final isRescuer = getIt<AppSession>().isRescuer;
      if (isRescuer) {
        context.go('/rescuer-map');
      } else {
        context.go('/map');
      }
    } else {
      context.go(_baseRoutes[index]);
    }
  }

  @override
  Widget build(BuildContext context) {
    // Lấy URL thực tế hiện tại trên thanh điều hướng thông qua GoRouter
    final String currentLocation = GoRouterState.of(context).matchedLocation;
    final int currentIndex = _calculateCurrentIndex(currentLocation);

    return Scaffold(
      body: widget.child,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: currentIndex, // Đồng bộ động hoàn toàn
        onTap: (index) => _onTap(context, index),
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.map), label: 'Map'),
          BottomNavigationBarItem(icon: Icon(Icons.history), label: 'History'),
          BottomNavigationBarItem(icon: Icon(Icons.chat), label: 'Chat'),
          BottomNavigationBarItem(icon: Icon(Icons.notifications), label: 'Notify'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}