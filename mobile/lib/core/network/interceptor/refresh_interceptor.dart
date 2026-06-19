import 'package:dio/dio.dart';
import 'package:mobile/core/services/storage_service.dart';

// xử lý 401 + retry
class RefreshInterceptor extends Interceptor {
  final Dio dio;
  final StorageService storageService;
  bool isRefreshing = false;

  RefreshInterceptor(this.dio, this.storageService);

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    final request = err.requestOptions;

    // tránh loop refresh
    if (request.path.contains('/api/auth/refresh-token')) {
      return handler.next(err);
    }

    if (err.response?.statusCode == 401) {
      if (isRefreshing) {
        return handler.next(err);
      }

      isRefreshing = true;

      try {
        final refreshToken = await storageService.getRefreshToken();

        if (refreshToken == null || refreshToken.isEmpty) {
          isRefreshing = false;
          await storageService.clearToken();
          return handler.next(err);
        }

        final response = await dio.post(
          '/api/auth/refresh-token',
          data: {"data": refreshToken, "platform": "MOBILE"},
        );
        final data = response.data['data'];
        final newAccessToken = data is Map<String, dynamic>
            ? data['accessToken'] as String?
            : null;

        if (newAccessToken == null || newAccessToken.isEmpty) {
          isRefreshing = false;
          await storageService.clearToken();
          return handler.next(err);
        }

        await storageService.saveAccessToken(newAccessToken);

        isRefreshing = false;

        // retry request cũ
        final opts = request
          ..headers['Authorization'] = 'Bearer $newAccessToken';

        final retryResponse = await dio.fetch(opts);

        return handler.resolve(retryResponse);
      } catch (e) {
        isRefreshing = false;

        await storageService.clearToken();

        return handler.next(err);
      }
    }

    return handler.next(err);
  }
}
