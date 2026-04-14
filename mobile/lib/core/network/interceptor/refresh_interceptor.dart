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
    if (request.path.contains('/auth/refresh-token')) {
      return handler.next(err);
    }

    if (err.response?.statusCode == 401) {
      if (isRefreshing) {
        return handler.next(err);
      }

      isRefreshing = true;

      try {
        final refreshToken = await storageService.getRefreshToken();

        final response = await dio.post(
          '/auth/refresh-token',
          data: {"data": refreshToken, "platform": "MOBILE"},
        );
        final newAccessToken = response.data['data']['accessToken'];

        await storageService.saveAccessToken(newAccessToken);

        isRefreshing = false;

        // retry request cũ
        final opts = request
          ..headers['Authorization'] = 'Bearer $newAccessToken';

        final retryResponse = await dio.fetch(opts);

        return handler.resolve(retryResponse);
      } catch (e) {
        isRefreshing = false;

        await storageService.clear();

        return handler.next(err);
      }
    }

    return handler.next(err);
  }
}
