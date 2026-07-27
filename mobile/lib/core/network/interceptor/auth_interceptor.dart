import 'package:dio/dio.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:mobile/core/storage/storage_service.dart';

class AuthInterceptor extends Interceptor {
  final StorageService storageService;

  AuthInterceptor(this.storageService);

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    // 1. Bỏ qua các endpoint không cần token
    if (options.path.contains('/api/auth/refresh-token') ||
        options.path.contains('/api/auth/login') ||
        options.path.contains('/api/auth/register')) {
      return handler.next(options);
    }

    String? token = await storageService.getAccessToken();

    // 2. Tự động kiểm tra hết hạn (JWT Expired) và gia hạn ngầm trước khi gửi request
    if (token == null || token.isEmpty || JwtDecoder.isExpired(token)) {
      final refreshToken = await storageService.getRefreshToken();

      if (refreshToken != null && refreshToken.isNotEmpty && !JwtDecoder.isExpired(refreshToken)) {
        try {
          final cleanDio = Dio(BaseOptions(
            baseUrl: options.baseUrl,
            connectTimeout: const Duration(seconds: 15),
            receiveTimeout: const Duration(seconds: 15),
          ));

          final res = await cleanDio.post('/api/auth/refresh-token', data: {
            "data": refreshToken,
            "platform": "MOBILE",
          });

          final data = res.data['data'];
          if (data is Map<String, dynamic> && data['accessToken'] != null) {
            token = data['accessToken'] as String;
            await storageService.saveAccessToken(token);
            print("🟢 [AuthInterceptor] Đã âm thầm gia hạn Token mới thành công trước khi gửi Request!");
          }
        } catch (e) {
          print("🚨 [AuthInterceptor] Tự động gia hạn Token thất bại: $e");
        }
      }
    }

    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
      try {
        final DateTime expDate = JwtDecoder.getExpirationDate(token);
        final Duration remaining = expDate.difference(DateTime.now());
        if (!remaining.isNegative) {
          final int mins = remaining.inMinutes;
          final int secs = remaining.inSeconds % 60;
          print("⏳ [API REQ] Access Token còn $mins phút $secs giây | Path: ${options.path}");
        }
      } catch (_) {}
    }

    handler.next(options);
  }
}