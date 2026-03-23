import 'package:go_router/go_router.dart';
import 'package:mobile/core/navigation/widgets/bottom_nav_bar.widget.dart';
import 'package:mobile/feature/auth/presentation/screens/login.screen.dart';
import 'package:mobile/feature/history/presentation/screens/history_list.screen.dart';
import 'package:mobile/feature/messages/presentation/screens/chat_list.screen.dart';
import 'package:mobile/feature/notification/presentation/screens/notificatin.screen.dart';
import 'package:mobile/feature/user/presentation/screens/profile.screen.dart';

import '../../feature/map/presentation/screens/map.screen.dart';

class AppRouter {
  static final GoRouter goRouter = GoRouter(
    initialLocation: '/map',

    routes: [
      // ===== AUTH (không có bottom nav) =====
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),

      // ===== SHELL (có bottom nav) =====
      ShellRoute(
        builder: (context, state, child) {
          return BottomNavBarWidget(child: child);
        },
        routes: [
          GoRoute(
            path: '/map',
            name: 'Map',
            pageBuilder: (context, state) {
              return const NoTransitionPage(
                child: MapScreen(),
              );
            },
          ),
          GoRoute(
            path: '/notifications',
            name: 'Thông báo',
            pageBuilder: (context, state) {
              return const NoTransitionPage(
                child: NotificationScreen(),
              );
            },
          ),
          GoRoute(
            path: '/messages',
            name: 'Tin nhắn',
            pageBuilder: (context, state) {
              return const NoTransitionPage(
                child: ChatListScreen(),
              );
            },
          ),
          GoRoute(
            path: '/history',
            name: 'Lịch sử',
            pageBuilder: (context, state) {
              return const NoTransitionPage(
                child: HistoryListScreen(),
              );
            },
          ),
          GoRoute(
            path: '/profile',
            name: 'Cá nhân',
            pageBuilder: (context, state) {
              return const NoTransitionPage(
                child: ProfileScreen(),
              );
            },
          ),
        ],
      ),
    ],
  );
}