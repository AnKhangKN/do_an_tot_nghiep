import 'package:flutter/material.dart';
import 'package:mobile/core/bootstrap/app_bootstrap.dart';
import 'package:mobile/core/incident_types/repository/incident_type_repository.dart';
import 'package:mobile/core/session/app_session.dart';
import 'package:mobile/core/socket/index_socket.dart';
import 'package:mobile/core/storage/storage_service.dart';
import 'package:mobile/feature/map/providers/rescuer_map_provider.dart';
import 'package:mobile/feature/splash/providers/splash_provider.dart';
import 'package:mobile/feature/user/repositories/user_repository.dart';
import 'package:provider/provider.dart';

import '../../feature/auth/repositories/auth_repository.dart';
import '../../feature/auth/providers/auth_provider.dart';
import '../../feature/rescue/providers/register_rescuer_provider.dart';
import '../../feature/rescue/repositories/rescuer_repositories.dart';
import '../../feature/user/providers/user_provider.dart';
import '../di/di.dart';

class AppProviders extends StatelessWidget {
  final Widget child;

  const AppProviders({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) =>
              AuthProvider(getIt<AuthRepository>(), getIt<AppSession>(), getIt<StorageService>()),
        ),

        ChangeNotifierProvider(
          create: (_) => UserProvider(getIt<UserRepository>()),
        ),

        ChangeNotifierProvider(
          create: (_) => RegisterRescuerProvider(
            getIt<RescuerRepositories>(),
            getIt<IncidentTypeRepository>(),
          ),
        ),

        ChangeNotifierProvider(
          create: (_) => RescuerMapProvider(getIt<AppSession>()),
        ),

        Provider(
          create: (_) => SplashProvider(getIt<AppBootstrap>(), getIt<StorageService>(), getIt<AppSession>()),
        )
      ],
      child: child,
    );
  }
}
