import 'package:flutter/material.dart';
import 'package:mobile/feature/user/user_repository.dart';
import 'package:provider/provider.dart';

import '../../feature/auth/data/auth_repository.dart';
import '../../feature/auth/presentation/auth_provider.dart';
import '../../feature/user/presentation/user_provider.dart';
import '../services/storage_service.dart';

class AppProviders extends StatelessWidget {
  final StorageService storageService;
  final AuthRepository authRepository;
  final UserRepository userRepository;
  final Widget child; // 🔥 THÊM DÒNG NÀY

  const AppProviders({
    super.key,
    required this.storageService,
    required this.authRepository,
    required this.userRepository,
    required this.child, // 🔥 THÊM DÒNG NÀY
  });

  @override
  Widget build(BuildContext context) {
    print("🔥 APP PROVIDERS BUILD");
    return MultiProvider(
      providers: [
        Provider<StorageService>.value(value: storageService),
        ChangeNotifierProvider(create: (_) => AuthProvider(authRepository)),
        ChangeNotifierProvider(create: (_) => UserProvider(userRepository)),
      ],
      child: child, // 🔥 THÊM DÒNG NÀY
    );
  }
}