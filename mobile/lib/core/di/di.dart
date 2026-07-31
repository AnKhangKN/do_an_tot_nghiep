import 'package:dio/dio.dart';
import 'package:get_it/get_it.dart';
import 'package:mobile/core/background/background_service.dart';
import 'package:mobile/core/firebase/notification_service.dart';
import 'package:mobile/core/incident_types/data/incident_type_service.dart';
import 'package:mobile/core/location/data/location_repository.dart';
import 'package:mobile/core/location/data/location_service.dart';
import 'package:mobile/core/session/app_session.dart';
import 'package:mobile/core/session/session_controller.dart';
import 'package:mobile/core/socket/core_socket.dart';
import 'package:mobile/core/socket/modules/ban_socket.dart';
import 'package:mobile/core/socket/modules/heartbeat_socket.dart';
import 'package:mobile/core/socket/modules/location_socket.dart';
import 'package:mobile/core/socket/modules/rescuer_socket.dart';
import 'package:mobile/core/socket/modules/victim_socket.dart';
import 'package:mobile/core/storage/storage_service.dart';
import 'package:mobile/core/theme/theme_controller.dart';
import 'package:mobile/features/auth/data/auth_repository.dart';
import 'package:mobile/features/auth/data/auth_service.dart';
import 'package:mobile/features/rescuer/data/rescuer_service.dart';
import 'package:mobile/features/rescuer/presentation/providers/sos_provider.dart';
import 'package:mobile/features/user/data/user_repository.dart';
import 'package:mobile/features/user/data/user_service.dart';
import 'package:mobile/features/victim/data/victim_repository.dart';
import 'package:mobile/features/victim/data/victim_service.dart';
import 'package:mobile/features/history/data/history_service.dart';
import 'package:mobile/features/chat/data/chat_service.dart';
import 'package:mobile/features/chat/data/chat_repository.dart';
import 'package:mobile/core/socket/modules/chat_socket.dart';
import 'package:mobile/features/chat/presentation/providers/chat_provider.dart';
import 'package:mobile/features/notification/data/notification_service.dart';
import 'package:mobile/features/notification/presentation/providers/notification_provider.dart';

import '../../features/rescuer/data/rescuer_repository.dart';
import '../incident_types/data/incident_type_repository.dart';
import '../network/dio_client.dart';
import '../network/interceptor/refresh_interceptor.dart';
import '../dangerous_points/data/dangerous_point_service.dart';
import '../dangerous_points/data/dangerous_point_repository.dart';
import '../../features/rating/data/rating_service.dart';
import '../../features/rating/data/rating_repository.dart';
import '../../features/dangerous_points/presentation/providers/geofence_provider.dart';
import '../../features/emergency_amenities/data/services/emergency_amenity_service.dart';
import '../../features/emergency_amenities/data/repositories/emergency_amenity_repository.dart';
import '../../features/emergency_amenities/presentation/providers/amenity_provider.dart';

final GetIt getIt = GetIt.instance;

/// Khởi tạo và đăng ký toàn bộ dependency của ứng dụng.
Future<void> initDI() async {
  // 1. Khởi tạo StorageService và CHẮC CHẮN nó đã sẵn sàng
  final storageService = StorageService();
  getIt.registerSingleton<StorageService>(storageService);

  // 2. Khởi tạo và cấu hình cấu trúc mạng (Dio) thống nhất
  getIt.registerLazySingleton<DioClient>(() {
    final baseDio = Dio();
    return DioClient(dio: baseDio, storageService: storageService);
  });


  // Đăng ký các service hệ thống còn lại
  getIt.registerLazySingleton(() => BackgroundService());
  getIt.registerLazySingleton(() => CoreSocket());
  getIt.registerLazySingleton(() => LocationService());
  getIt.registerLazySingleton(() => SessionController());
  getIt.registerLazySingleton(() => HeartbeatSocket(getIt<CoreSocket>()));
  getIt.registerLazySingleton(() => LocationSocket(getIt<CoreSocket>()));
  getIt.registerLazySingleton(() => ChatSocket(getIt<CoreSocket>()));
  getIt.registerLazySingleton<SOSProvider>(() => SOSProvider());
  getIt.registerLazySingleton(
    () => ChatProvider(
      chatRepository: getIt<ChatRepository>(),
      chatSocket: getIt<ChatSocket>(),
      sessionController: getIt<SessionController>(),
      storageService: getIt<StorageService>(),
    ),
  );
  getIt.registerLazySingleton(
    () => RescuerSocket(getIt<CoreSocket>(), getIt<SOSProvider>()),
  );
  getIt.registerLazySingleton(
    () => VictimSocket(getIt<CoreSocket>(), getIt<SessionController>()),
  );
  getIt.registerLazySingleton(
    () => BanSocket(getIt<CoreSocket>(), getIt<SessionController>()),
  );
  getIt.registerLazySingleton(() => NotificationService());
  getIt.registerLazySingleton(
    () => ThemeController(getIt<StorageService>()),
  );

  // Các Service lấy trực tiếp .dio đã được cấu hình chuẩn chỉ
  getIt.registerLazySingleton(() => AuthService(getIt<DioClient>().dio));
  getIt.registerLazySingleton(() => UserService(getIt<DioClient>().dio));
  getIt.registerLazySingleton(() => RescuerService(getIt<DioClient>().dio));
  getIt.registerLazySingleton(
    () => IncidentTypeService(getIt<DioClient>().dio),
  );
  getIt.registerLazySingleton(
    () => DangerousPointService(getIt<DioClient>().dio),
  );
  getIt.registerLazySingleton(() => VictimService(getIt<DioClient>().dio));
  getIt.registerLazySingleton(() => HistoryService(getIt<DioClient>().dio));
  getIt.registerLazySingleton(() => ChatService(getIt<DioClient>().dio));
  getIt.registerLazySingleton(() => MobileNotificationService(getIt<DioClient>().dio));
  getIt.registerLazySingleton(() => RatingService(getIt<DioClient>().dio));
  getIt.registerLazySingleton(() => EmergencyAmenityService(getIt<DioClient>().dio));
  getIt.registerLazySingleton(() => NotificationProvider());
  getIt.registerLazySingleton(() => GeofenceProvider());
  getIt.registerLazySingleton(() => AmenityProvider(repository: getIt<EmergencyAmenityRepository>()));

  // Đăng ký các Repository
  getIt.registerLazySingleton<AuthRepository>(
    () => AuthRepository(getIt<AuthService>(), getIt<StorageService>()),
  );
  getIt.registerLazySingleton(() => UserRepository(getIt<UserService>()));
  getIt.registerLazySingleton(
    () => LocationRepository(
      getIt<LocationService>(),
      getIt<SessionController>(),
    ),
  );
  getIt.registerLazySingleton(() => RescuerRepository(getIt<RescuerService>()));
  getIt.registerLazySingleton(
    () => IncidentTypeRepository(getIt<IncidentTypeService>()),
  );
  getIt.registerLazySingleton(
    () => DangerousPointRepository(getIt<DangerousPointService>()),
  );
  getIt.registerLazySingleton(() => EmergencyAmenityRepository(getIt<EmergencyAmenityService>()));
  getIt.registerLazySingleton(() => VictimRepository(getIt<VictimService>()));
  getIt.registerLazySingleton(() => ChatRepository(getIt<ChatService>()));
  getIt.registerLazySingleton(() => RatingRepository(getIt<RatingService>()));

  getIt.registerLazySingleton(
    () => AppSession(
      controller: getIt(),
      storageService: getIt(),
      socket: getIt(),
      background: getIt(),
      authRepository: getIt<AuthRepository>(),
      heartbeatSocket: getIt<HeartbeatSocket>(),
      locationSocket: getIt<LocationSocket>(),
      locationRepository: getIt<LocationRepository>(),
      rescuerSocket: getIt<RescuerSocket>(),
      victimSocket: getIt<VictimSocket>(),
      banSocket: getIt<BanSocket>(),
      notificationService: getIt<NotificationService>()
    ),
  );
}
