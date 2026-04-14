import 'package:dio/dio.dart';
import 'package:mobile/core/services/storage_service.dart';

// Gắn token
class AuthInterceptor extends Interceptor {
  final StorageService storageService;

  AuthInterceptor(this.storageService);

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    final token = await storageService.getAccessToken();

    print("🔐 TOKEN FROM STORAGE: $token");

    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }

    print("📤 HEADERS SENT: ${options.headers}");

    handler.next(options);
  }
}
