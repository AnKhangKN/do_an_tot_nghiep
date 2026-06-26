import 'package:dio/dio.dart';

import '../../storage/storage_service.dart';

// Gắn token
class AuthInterceptor extends Interceptor {
  final StorageService storageService;

  AuthInterceptor(this.storageService);

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    final token = await storageService.getAccessToken();

    print("TOKEN = $token");

    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }
}
