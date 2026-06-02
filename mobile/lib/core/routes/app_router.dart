import 'package:go_router/go_router.dart';
import 'package:mobile/core/constants/app_router_constants.dart';
import 'package:mobile/core/navigation/widgets/bottom_nav_bar_widget.dart';
import 'package:mobile/feature/auth/presentation/screens/register_screen.dart';

import '../../feature/auth/presentation/screens/login_screen.dart';
import '../../feature/history/presentation/screens/history_list_screen.dart';
import '../../feature/map/presentation/screens/map_screen.dart';
import '../../feature/messages/presentation/screens/chat_list_screen.dart';
import '../../feature/notification/presentation/screens/notification_screen.dart';
import '../../feature/splash/presentation/screens/splash_screen.dart';
import '../../feature/user/presentation/screens/profile_screen.dart';

class AppRouter {
  static final GoRouter goRouter = GoRouter(
    initialLocation: RouterConstants.splash,

    routes: [
      GoRoute(
        path: RouterConstants.splash,
        name: 'splash',
        builder: (context, state) => const SplashScreen(),
      ),

      // ===== AUTH (không có bottom nav) =====
      GoRoute(
        path: RouterConstants.login,
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),

      GoRoute(
        path: RouterConstants.register,
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
            path: RouterConstants.map,
            name: 'Map',
            pageBuilder: (context, state) {
              return const NoTransitionPage(child: MapScreen());
            },
          ),
          GoRoute(
            path: RouterConstants.notification,
            name: 'Thông báo',
            pageBuilder: (context, state) {
              return const NoTransitionPage(child: NotificationScreen());
            },
          ),
          GoRoute(
            path: RouterConstants.messages,
            name: 'Tin nhắn',
            pageBuilder: (context, state) {
              return const NoTransitionPage(child: ChatListScreen());
            },
          ),
          GoRoute(
            path: RouterConstants.history,
            name: 'Lịch sử',
            pageBuilder: (context, state) {
              return const NoTransitionPage(child: HistoryListScreen());
            },
          ),
          GoRoute(
            path: RouterConstants.profile,
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
