import 'package:dio/dio.dart';
import 'package:mobile/core/constants/app_constants.dart';
import 'package:mobile/core/storage/storage_service.dart';

import 'interceptor/auth_interceptor.dart';
import 'interceptor/refresh_interceptor.dart';

class DioClient {
  final Dio dio;
  final StorageService storageService;

  // Sử dụng Named Parameter (tham số có đặt tên) và cấu hình BaseOptions ngay tại đây
  DioClient({
    required this.dio,
    required this.storageService,
  }) {
    dio.options
      ..baseUrl = AppConstants.baseUrl
      ..connectTimeout = const Duration(seconds: 10)
      ..receiveTimeout = const Duration(seconds: 10)
      ..contentType = Headers.jsonContentType;

    // Quản lý tất cả Interceptor tập trung tại đây cho sạch code
    dio.interceptors.addAll([
      AuthInterceptor(storageService), // Truyền storageService vào nếu AuthInterceptor cần lấy token
      RefreshInterceptor(dio, storageService),
      LogInterceptor(responseBody: true, requestBody: true),
    ]);
  }
}