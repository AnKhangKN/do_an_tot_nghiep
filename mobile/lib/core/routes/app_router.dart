import 'package:go_router/go_router.dart';
import 'package:mobile/core/navigation/widgets/bottom_nav_bar_widget.dart';
import 'package:mobile/feature/auth/presentation/screens/register_screen.dart';
import 'package:mobile/feature/map/screens/map_screen.dart';

import '../../feature/auth/presentation/screens/login_screen.dart';
import '../../feature/history/screens/history_list_screen.dart';
import '../../feature/messages/screens/chat_list_screen.dart';
import '../../feature/notification/screens/notification_screen.dart';
import '../../feature/splash/presentation/screens/splash_screen.dart';
import '../../feature/user/presentation/screens/profile_screen.dart';

class AppRouter {
  static final GoRouter goRouter = GoRouter(
    initialLocation: '/splash',

    routes: [
      GoRoute(
        path: '/splash',
        name: 'splash',
        builder: (context, state) => const SplashScreen(),
      ),

      // ===== AUTH (không có bottom nav) =====
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),

      GoRoute(
        path: '/register',
        name: 'register',
        builder: (context, state) => const RegisterScreen(),
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
              return const NoTransitionPage(child: MapScreen());
            },
          ),
          GoRoute(
            path: '/notifications',
            name: 'Thông báo',
            pageBuilder: (context, state) {
              return const NoTransitionPage(child: NotificationScreen());
            },
          ),
          GoRoute(
            path: '/messages',
            name: 'Tin nhắn',
            pageBuilder: (context, state) {
              return const NoTransitionPage(child: ChatListScreen());
            },
          ),
          GoRoute(
            path: '/history',
            name: 'Lịch sử',
            pageBuilder: (context, state) {
              return const NoTransitionPage(child: HistoryListScreen());
            },
          ),
          GoRoute(
            path: '/profile',
            name: 'Cá nhân',
            pageBuilder: (context, state) {
              return const NoTransitionPage(child: ProfileScreen());
            },
          ),
        ],
      ),
    ],
  );
}
