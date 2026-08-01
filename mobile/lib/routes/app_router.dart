import 'package:go_router/go_router.dart';
import 'package:mobile/features/rescuer/presentation/screens/rescuer_register_screen.dart';
import 'package:mobile/routes/widgets/main_shell.dart';
import '../core/constants/router_constants.dart';
import '../core/di/di.dart';
import '../core/session/app_session.dart';
import '../features/rescuer/presentation/screens/rescuer_map_screen.dart';
import '../features/splash/presentation/screens/splash_screen.dart';
import '../features/auth/presentation/screens/login_screen.dart';
import '../features/auth/presentation/screens/register_screen.dart';
import '../features/auth/presentation/screens/verify_otp_screen.dart';
import '../features/auth/presentation/screens/forgot_password_screen.dart';
import '../features/history/presentation/screens/history_screen.dart';
import '../features/chat/presentation/screens/chat_screen.dart';
import '../features/notification/presentation/screens/notification_screen.dart';
import '../features/user/presentation/screens/profile_screen.dart';
import '../features/user/presentation/screens/profile_detail_screen.dart';
import '../features/dangerous_points/presentation/screens/my_dangerous_points_screen.dart';
import '../features/emergency_amenities/presentation/screens/my_amenities_screen.dart';
import '../features/settings/presentation/screens/settings_screen.dart';
import '../features/help_center/presentation/screens/help_center_screen.dart';
import '../features/app_info/presentation/screens/app_info_screen.dart';
import '../features/404/screens/not_found_screen.dart';

import '../features/victim/presentation/screens/victim_map_screen.dart';

class AppRouter {
  static final AppSession _appSession = getIt<AppSession>();

  static final GoRouter router = GoRouter(
    initialLocation: RouterConstants.splash,
    refreshListenable: _appSession.controller,

    redirect: (context, state) {

      // Nếu app chưa khởi tạo xong (đang load API /me), bắt buộc ở lại Splash
      if (!_appSession.isInitialized) {
        return RouterConstants.splash;
      }

      final isLoggedIn = _appSession.isLoggedIn;
      final isRescuer = _appSession.isRescuer;
      final isSplash = state.matchedLocation == RouterConstants.splash;
      final isLogin = state.matchedLocation == RouterConstants.login;
      final isRegister = state.matchedLocation == RouterConstants.register;
      final isVerifyOtp = state.matchedLocation == RouterConstants.verifyOtp;
      final isForgotPassword = state.matchedLocation == RouterConstants.forgotPassword;

      // 1. Nếu đang ở Splash mà đã khởi tạo xong
      if (isSplash) {
        if (isLoggedIn) {
          return isRescuer ? RouterConstants.rescuerMap : RouterConstants.map;
        } else {
          return RouterConstants.login;
        }
      }

      // 2. Nếu chưa đăng nhập mà cố tình vào các màn hình bên trong -> Đá về Login (ngoại trừ Login, Register, VerifyOtp và ForgotPassword)
      if (!isLoggedIn && !isLogin && !isRegister && !isVerifyOtp && !isForgotPassword) {
        return RouterConstants.login;
      }

      // 3. Nếu đã đăng nhập rồi mà cố tình quay lại màn hình Login hoặc Register -> Đá vào Home
      if (isLoggedIn && (isLogin || isRegister || isVerifyOtp)) {
        return isRescuer ? RouterConstants.rescuerMap : RouterConstants.map;
      }

      return null; // Các trường hợp hợp lệ khác cho phép đi tiếp
    },

    routes: [
      GoRoute(
        path: RouterConstants.splash,
        builder: (context, state) => const SplashScreen(),
      ),

      GoRoute(path: RouterConstants.login, builder: (context, state) => const LoginScreen()),

      GoRoute(path: RouterConstants.forgotPassword, builder: (context, state) => const ForgotPasswordScreen()),

      GoRoute(path: RouterConstants.register, builder: (context, state) => const RegisterScreen()),

      GoRoute(
        path: RouterConstants.verifyOtp,
        builder: (context, state) {
          final email = state.extra as String? ?? '';
          return VerifyOtpScreen(email: email);
        },
      ),

      GoRoute(path: RouterConstants.registerRescuer, builder: (context, state) => const RescuerRegisterScreen()),

      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return MainShell(navigationShell: navigationShell);
        },
        branches: [
          // Tab 0: Bản đồ (Victim + Rescuer)
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: RouterConstants.map,
                builder: (context, state) => const VictimMapScreen(),
              ),
              GoRoute(
                path: RouterConstants.rescuerMap,
                builder: (context, state) => const RescuerMapScreen(),
              ),
            ],
          ),
          // Tab 1: Lịch sử
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: RouterConstants.history,
                builder: (context, state) => const HistoryScreen(),
              ),
            ],
          ),
          // Tab 2: Chat
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: RouterConstants.chat,
                builder: (context, state) => const ChatScreen(),
              ),
            ],
          ),
          // Tab 3: Thông báo
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: RouterConstants.notification,
                builder: (context, state) => const NotificationScreen(),
              ),
            ],
          ),
          // Tab 4: Cá nhân + các màn con (giữ bottom nav khi mở)
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: RouterConstants.profile,
                builder: (context, state) => const ProfileScreen(),
              ),
              GoRoute(
                path: RouterConstants.profileDetail,
                builder: (context, state) => const ProfileDetailScreen(),
              ),
              GoRoute(
                path: RouterConstants.myDangerousPoints,
                builder: (context, state) => const MyDangerousPointsScreen(),
              ),
              GoRoute(
                path: RouterConstants.myAmenities,
                builder: (context, state) => const MyAmenitiesScreen(),
              ),
              GoRoute(
                path: RouterConstants.setting,
                builder: (context, state) => const SettingsScreen(),
              ),
              GoRoute(
                path: RouterConstants.helpCenter,
                builder: (context, state) => const HelpCenterScreen(),
              ),
              GoRoute(
                path: RouterConstants.appInfo,
                builder: (context, state) => const AppInfoScreen(),
              ),
            ],
          ),
        ],
      ),
    ],

    errorBuilder: (context, state) => const NotFoundScreen(),
  );
}
