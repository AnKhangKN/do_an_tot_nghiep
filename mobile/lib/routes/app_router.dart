import 'package:go_router/go_router.dart';
import 'package:mobile/core/storage/storage_service.dart';
import 'package:mobile/features/map/presentation/screens/rescuer_map_screen.dart';
import 'package:mobile/routes/widgets/main_shell.dart';
import '../core/constants/router_constants.dart';
import '../core/di/di.dart';
import '../core/session/app_session.dart';
import '../features/splash/presentation/screens/splash_screen.dart';
import '../features/auth/presentation/screens/login_screen.dart';
import '../features/map/presentation/screens/victim_map_screen.dart';
import '../features/history/presentation/screens/history_screen.dart';
import '../features/chat/presentation/screens/chat_screen.dart';
import '../features/notification/presentation/screens/notification_screen.dart';
import '../features/user/presentation/screens/profile_screen.dart';
import '../features/404/screens/not_found_screen.dart';

import 'route_guards.dart';

class AppRouter {
  static final AppSession _appSession = getIt<AppSession>();
  static final RouteGuards _routeGuards = RouteGuards(_appSession);

  static final GoRouter router = GoRouter(
    initialLocation: '/splash',

    refreshListenable: _appSession.controller,

    // =========================
    // GLOBAL GUARD
    // =========================
    redirect: (context, state) {
      print(
        'ROUTER => '
            'initialized=${_appSession.isInitialized}, '
            'loggedIn=${_appSession.isLoggedIn}, '
            'location=${state.matchedLocation}',
      );

      // Nếu app chưa khởi tạo xong (đang load API /me), bắt buộc ở lại Splash
      if (!_appSession.isInitialized) {
        return '/splash';
      }

      final isLoggedIn = _appSession.isLoggedIn;
      final isRescuer = _appSession.isRescuer;
      final isSplash = state.matchedLocation == '/splash';
      final isLogin = state.matchedLocation == '/login';

      // 1. Nếu đang ở Splash mà đã khởi tạo xong
      if (isSplash) {
        if (isLoggedIn) {
          return isRescuer ? '/rescuer-map' : '/map';
        } else {
          return '/login';
        }
      }

      // 2. Nếu chưa đăng nhập mà cố tình vào các màn hình bên trong -> Đá về Login
      if (!isLoggedIn && !isLogin) {
        return '/login';
      }

      // 3. Nếu đã đăng nhập rồi mà cố tình quay lại màn hình Login -> Đá vào Home
      if (isLoggedIn && isLogin) {
        return isRescuer ? '/rescuer-map' : '/map';
      }

      return null; // Các trường hợp hợp lệ khác cho phép đi tiếp
    },

    routes: [
      // =========================
      // SPLASH
      // =========================
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),

      // =========================
      // AUTH
      // =========================
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),

      ShellRoute(
        builder: (context, state, child) {
          return MainShell(child: child);
        },
        routes: [
          GoRoute(path: '/map', builder: (context, state) => const MapScreen()),
          GoRoute(
            path: '/rescuer-map',
            builder: (context, state) => const RescuerMapScreen(),
          ),
          GoRoute(
            path: '/history',
            builder: (context, state) => const HistoryScreen(),
          ),
          GoRoute(
            path: '/chat',
            builder: (context, state) => const ChatScreen(),
          ),
          GoRoute(
            path: '/notifications',
            builder: (context, state) => const NotificationScreen(),
          ),
          GoRoute(
            path: '/profile',
            builder: (context, state) => const ProfileScreen(),
          ),
        ],
      ),
    ],

    // =========================
    // 404
    // =========================
    errorBuilder: (context, state) => const NotFoundScreen(),
  );
}
