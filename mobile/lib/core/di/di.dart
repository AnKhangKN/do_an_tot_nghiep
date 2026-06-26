import 'package:dio/dio.dart';
import 'package:get_it/get_it.dart';
import 'package:mobile/core/bootstrap/app_bootstrap.dart';
import 'package:mobile/core/constants/app_constants.dart';
import 'package:mobile/core/incident_types/repository/incident_type_repository.dart';
import 'package:mobile/core/incident_types/services/incident_type_service.dart';
import 'package:mobile/core/network/interceptor/auth_interceptor.dart';
import 'package:mobile/core/network/interceptor/refresh_interceptor.dart';
import 'package:mobile/core/socket/index_socket.dart';
import 'package:mobile/core/storage/storage_service.dart';
import 'package:mobile/feature/auth/providers/auth_provider.dart';
import 'package:mobile/feature/auth/repositories/auth_repository.dart';
import 'package:mobile/feature/auth/services/auth_service.dart';
import 'package:mobile/feature/rescue/providers/register_rescuer_provider.dart';
import 'package:mobile/feature/rescue/repositories/rescuer_repositories.dart';
import 'package:mobile/feature/rescue/services/rescuer_services.dart';
import 'package:mobile/feature/user/providers/user_provider.dart';
import 'package:mobile/feature/user/services/user_service.dart';

import '../../feature/user/repositories/user_repository.dart';
import '../session/app_session.dart';

final getIt = GetIt.instance;

Future<void> setupDI() async {
  // core
  getIt.registerLazySingleton(() => StorageService());

  final dio = Dio(BaseOptions(baseUrl: AppConstants.baseUrl));

  final storageService = getIt<StorageService>();

  dio.interceptors.addAll([
    AuthInterceptor(storageService),
    RefreshInterceptor(dio, storageService),
  ]);

  getIt.registerLazySingleton(() => dio);

  // service
  getIt.registerLazySingleton(() => AuthService(dio));
  getIt.registerLazySingleton(() => UserService(dio));
  getIt.registerLazySingleton(() => RescuerServices(dio));
  getIt.registerLazySingleton(() => IncidentTypeService(dio));

  // repository
  getIt.registerLazySingleton(() => AuthRepository(getIt(), getIt()));
  getIt.registerLazySingleton(() => UserRepository(getIt()));
  getIt.registerLazySingleton(() => RescuerRepositories(getIt()));
  getIt.registerLazySingleton(() => IncidentTypeRepository(getIt()));

  // socket
  getIt.registerLazySingleton(() => IndexSocket(getIt()));

  // App session dùng để tạo kết nối socket
  getIt.registerLazySingleton(() => AppSession(getIt()));

  // App bootstrap
  getIt.registerLazySingleton(() => AppBootstrap(getIt()));
}
