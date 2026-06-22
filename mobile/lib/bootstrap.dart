import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:mobile/core/incident_types/repository/incident_type_repository.dart';
import 'package:mobile/feature/user/repositories/user_repository.dart';

import 'app.dart';
import 'core/constants/app_constants.dart';
import 'core/incident_types/services/incident_type_service.dart';
import 'core/network/interceptor/auth_interceptor.dart';
import 'core/network/interceptor/refresh_interceptor.dart';

import 'core/storage/storage_service.dart';
import 'feature/auth/services/auth_service.dart';
import 'feature/auth/repositories/auth_repository.dart';

import 'core/provider/app_providers.dart';
import 'feature/rescue/repositories/rescuer_repositories.dart';
import 'feature/rescue/services/rescuer_services.dart';
import 'feature/user/services/user_service.dart';

Future<Widget> bootstrap() async {
  final storageService = StorageService();

  final dio = Dio(
    BaseOptions(
      baseUrl: AppConstants.baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
    ),
  );

  dio.interceptors.addAll([
    AuthInterceptor(storageService),
    RefreshInterceptor(dio, storageService),
  ]);

  final authRepository = AuthRepository(AuthService(dio), storageService);
  final userRepository = UserRepository(UserService(dio));
  final rescuerRepository = RescuerRepositories(RescuerServices(dio));
  final incidentRepository = IncidentTypeRepository(IncidentTypeService(dio));

  return AppProviders(
    storageService: storageService,
    authRepository: authRepository,
    userRepository: userRepository,
    registerRescuerRepository: rescuerRepository,
    incidentTypeRepository: incidentRepository,
    child: const App(),
  );
}