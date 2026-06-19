import 'package:flutter/material.dart';
import 'package:mobile/feature/user/repositories/user_repository.dart';
import 'package:provider/provider.dart';

import '../../feature/auth/repositories/auth_repository.dart';
import '../../feature/auth/providers/auth_provider.dart';
import '../../feature/rescue/providers/register_rescuer_provider.dart';
import '../../feature/rescue/repositories/rescuer_repositories.dart';
import '../../feature/user/providers/user_provider.dart';
import '../services/storage_service.dart';

class AppProviders extends StatelessWidget {
  final StorageService storageService;
  final AuthRepository authRepository;
  final UserRepository userRepository;
  final RescuerRepositories registerRescuerRepository;
  final Widget child; // THÊM DÒNG NÀY

  const AppProviders({
    super.key,
    required this.storageService,
    required this.authRepository,
    required this.userRepository,
    required this.registerRescuerRepository,
    required this.child, // 🔥 THÊM DÒNG NÀY
  });

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<StorageService>.value(value: storageService),
        ChangeNotifierProvider(create: (_) => AuthProvider(authRepository)),
        ChangeNotifierProvider(create: (_) => UserProvider(userRepository)),
        ChangeNotifierProvider(
          create: (_) => RegisterRescuerProvider(registerRescuerRepository),
        ),
      ],
      child: child, // 🔥 THÊM DÒNG NÀY
    );
  }
}
