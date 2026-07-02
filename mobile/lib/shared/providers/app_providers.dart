import 'package:flutter/material.dart';
import 'package:mobile/core/di/di.dart';
import 'package:mobile/core/location/data/location_repository.dart';
import 'package:mobile/core/session/app_session.dart';
import 'package:mobile/core/storage/storage_service.dart';
import 'package:mobile/features/user/data/user_repository.dart';
import 'package:provider/provider.dart';

import '../../core/session/session_controller.dart';
import '../../features/auth/data/auth_repository.dart';
import '../../features/auth/presentation/providers/auth_provider.dart';
import '../../features/map/presentation/providers/rescuer_map_provider.dart';
import '../../features/splash/presentation/providers/splash_provider.dart';
import '../../features/user/presentation/providers/user_provider.dart';

class AppProviders extends StatelessWidget {
  final Widget child;

  const AppProviders({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        // Auth Provider
        ChangeNotifierProvider(
          create: (_) => AuthProvider(
            getIt<AuthRepository>(),
            getIt<AppSession>(),
            getIt<StorageService>(),
          ),
        ),

        // HistoryProvider
        // MapProvider
        // RescuerMapProvider
        ChangeNotifierProvider(
          create: (_) => RescuerMapProvider(getIt<AppSession>(), getIt<LocationRepository>()),
        ),
        // MessageProvider
        // Notification
        // RescueProvider
        // SplashProvider
        ChangeNotifierProvider(
          create: (_) =>
              SplashProvider(getIt<AppSession>()),
        ),

        // UserProvider
        ChangeNotifierProvider<UserProvider>(
          create: (_) => UserProvider(
            getIt<UserRepository>(),
          ),
        ),
        // App Session
        Provider<AppSession>(create: (_) => getIt<AppSession>()),

        // Session Controller
        // ChangeNotifierProvider(create: (_) => SessionController()),
      ],
      child: child,
    );
  }
}
