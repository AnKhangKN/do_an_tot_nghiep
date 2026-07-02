import 'package:dio/dio.dart';
import 'package:get_it/get_it.dart';
import 'package:mobile/core/background/background_service.dart';
import 'package:mobile/core/location/data/location_repository.dart';
import 'package:mobile/core/location/data/location_service.dart';
import 'package:mobile/core/session/app_session.dart';
import 'package:mobile/core/session/session_controller.dart';
import 'package:mobile/core/socket/core_socket.dart';
import 'package:mobile/core/socket/modules/heartbeat_socket.dart';
import 'package:mobile/core/socket/modules/location_socket.dart';
import 'package:mobile/core/storage/storage_service.dart';
import 'package:mobile/features/auth/data/auth_repository.dart';
import 'package:mobile/features/auth/data/auth_service.dart';
import 'package:mobile/features/user/data/user_repository.dart';
import 'package:mobile/features/user/data/user_service.dart';

import '../network/dio_client.dart';
import '../network/interceptor/refresh_interceptor.dart';

final GetIt getIt = GetIt.instance;

/// Khởi tạo và đăng ký toàn bộ dependency của ứng dụng.
Future<void> initDI() async {
  // 1. Khởi tạo StorageService và CHẮC CHẮN nó đã sẵn sàng
  final storageService = StorageService();
  getIt.registerSingleton<StorageService>(storageService);

  // 2. Khởi tạo và cấu hình cấu trúc mạng (Dio) thống nhất
  getIt.registerLazySingleton<DioClient>(() {
    final baseDio = Dio();

    // SỬA TẠI ĐÂY: Thêm tên tham số cho RefreshInterceptor
    baseDio.interceptors.addAll([RefreshInterceptor(baseDio, storageService)]);

    // SỬA TẠI ĐÂY: Thêm tên tham số cho DioClient
    return DioClient(dio: baseDio, storageService: storageService);
  });

  // 3. Các Service lấy trực tiếp .dio đã được cấu hình chuẩn chỉ
  getIt.registerLazySingleton<AuthService>(
    () => AuthService(getIt<DioClient>().dio),
  );
  getIt.registerLazySingleton<UserService>(
    () => UserService(getIt<DioClient>().dio),
  );

  // 4. Đăng ký các Repository
  getIt.registerLazySingleton<AuthRepository>(
    () => AuthRepository(getIt<AuthService>(), getIt<StorageService>()),
  );
  getIt.registerLazySingleton(() => UserRepository(getIt<UserService>()));
  getIt.registerLazySingleton(() => LocationRepository());

  // 5. Đăng ký các service hệ thống còn lại
  getIt.registerLazySingleton(() => BackgroundService());
  getIt.registerLazySingleton(() => CoreSocket());
  getIt.registerLazySingleton(() => LocationService());
  getIt.registerLazySingleton(() => SessionController());
  getIt.registerLazySingleton(() => HeartbeatSocket(getIt<CoreSocket>()));
  getIt.registerLazySingleton(() => LocationSocket(getIt<CoreSocket>()));

  getIt.registerLazySingleton(
    () => AppSession(
      controller: getIt(),
      storageService: getIt(),
      socket: getIt(),
      background: getIt(),
      authRepository: getIt<AuthRepository>(),
      heartbeatSocket: getIt<HeartbeatSocket>(),
      locationSocket: getIt<LocationSocket>(),
      locationRepository: getIt<LocationRepository>()
    ),
  );
}
