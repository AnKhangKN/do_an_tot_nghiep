import 'package:go_router/go_router.dart';
import 'package:mobile/core/constants/app_router_constants.dart';
import 'package:mobile/core/navigation/widgets/bottom_nav_bar_widget.dart';
import '../../feature/404/screens/not_found_screen.dart';
import '../../feature/history/screens/history_list_screen.dart';
import '../../feature/map/screens/map_screen.dart';
import '../../feature/messages/screens/chat_list_screen.dart';
import '../../feature/notification/screens/notification_screen.dart';
import '../../feature/rescue/screens/register_rescuer_screen.dart';
import '../../feature/rescue/screens/register_rescuer_step2_screen.dart';
import '../../feature/auth/screens/login_screen.dart';
import '../../feature/auth/screens/register_screen.dart';
import '../../feature/splash/screens/splash_screen.dart';
import '../../feature/user/screens/profile_screen.dart';

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

      GoRoute(
        path: RouterConstants.registerRescuer,
        name: 'register_rescuer',
        builder: (context, state) => const RegisterRescuerScreen(),
      ),

      GoRoute(path: RouterConstants.registerRescuerStep2,
      name: 'final_register_rescuer',
        pageBuilder: (context, state) {
          return const NoTransitionPage(child: RegisterRescuerStep2Screen());
        },
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

    errorBuilder: (context, state) {
      return const NotFoundScreen();
    },
  );
}
