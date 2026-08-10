import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:get_it/get_it.dart';

import '../../session/app_session.dart';
import '../../session/session_controller.dart';
import '../../storage/storage_service.dart';

/// Đưa người dùng về màn hình Login khi phiên đăng nhập không thể phục hồi
/// (không còn refresh token hoặc refresh token bị từ chối). Tránh trạng thái
/// "đăng nhập giả" gửi request không có token và nhận 401 mãi mãi.
Future<void> _forceLogoutForExpiredSession() async {
  GetIt.instance<SessionController>().setKickedFromOtherDevice(
    'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!',
  );
  await GetIt.instance<AppSession>().logout();
}

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

    if (err.response?.statusCode == 403) {
      final msg = err.response?.data is Map
          ? (err.response?.data as Map)['message']?.toString() ?? ''
          : '';
      if (msg.contains('đã bị khóa')) {
        final banReason = err.response?.data is Map
            ? (err.response?.data as Map)['banReason']?.toString()
            : null;
        GetIt.instance<SessionController>().setBanned(reason: banReason);
        return handler.next(err);
      }
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
          await GetIt.instance<AppSession>().logout();
          return handler.next(err);
        }

        final cleanDio = Dio(BaseOptions(
          baseUrl: request.baseUrl,
          connectTimeout: const Duration(seconds: 15),
          receiveTimeout: const Duration(seconds: 15),
        ));

        final response = await cleanDio.post(
          '/api/auth/refresh-token',
          data: {"data": refreshToken, "platform": "MOBILE"},
        );

        final data = response.data['data'];
        final newAccessToken = data is Map<String, dynamic>
            ? data['accessToken'] as String?
            : null;

        if (newAccessToken == null || newAccessToken.isEmpty) {
          isRefreshing = false;
          await _forceLogoutForExpiredSession();
          return handler.next(err);
        }

        await storageService.saveAccessToken(newAccessToken);

        isRefreshing = false;

        // retry request cũ với token mới
        final opts = request
          ..headers['Authorization'] = 'Bearer $newAccessToken';

        final retryResponse = await dio.fetch(opts);

        return handler.resolve(retryResponse);
      } on DioException catch (e) {
        isRefreshing = false;
        // Server từ chối chính thức (401) → refresh token đã hết hạn/bị vô hiệu
        // → phiên thực sự chết, tự đăng xuất để về màn hình Login.
        // Lỗi mạng/timeout/5xx chỉ là nhất thời → GIỮ token để request sau tự refresh lại.
        if (e.response?.statusCode == 401) {
          await _forceLogoutForExpiredSession();
        } else {
          debugPrint("⚠️ [RefreshInterceptor] Refresh thất bại (lỗi tạm thời, giữ token): $e");
        }
        return handler.next(err);
      } catch (e) {
        isRefreshing = false;
        debugPrint("⚠️ [RefreshInterceptor] Lỗi không xác định khi refresh (giữ token): $e");
        return handler.next(err);
      }
    }

    return handler.next(err);
  }
}