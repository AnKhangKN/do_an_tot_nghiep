import 'package:dio/dio.dart' as dio_package;
import 'package:flutter/material.dart';
import 'package:jwt_decoder/jwt_decoder.dart';

import '../../../core/storage/storage_service.dart';
import '../models/auth_model.dart';
import '../models/login_request.dart';
import '../models/refresh_token_request.dart';
import '../models/refresh_token_response.dart';
import '../models/user_model.dart';
import '../models/register_request.dart';
import '../models/register_response.dart';
import 'auth_service.dart';

class AuthRepository {
  final AuthService service;
  final StorageService storage;

  AuthRepository(this.service, this.storage);

  Future<String?> getValidAccessToken() async {
    // 1. Lấy access token hiện tại trong máy ra xem
    String? accessToken = await storage.getAccessToken();

    // 2. Kiểm tra nếu không có token hoặc token đã bay màu (hết hạn)
    if (accessToken == null || JwtDecoder.isExpired(accessToken)) {
      debugPrint("🎯 [AuthRepository] Token hết hạn hoặc không tồn tại. Đang tự động refresh...");

      // 3. 🌟 ĐÃ FIX: Hàm refreshToken() giờ trả về trực tiếp String?, hứng thẳng luôn
      final newAccessToken = await refreshToken();

      return newAccessToken;
    }

    // 4. Nếu token vẫn còn hạn sử dụng ngon lành, trả về xài tiếp, đỡ phải gọi API
    debugPrint("🎯 [AuthRepository] Token vẫn còn hạn, sử dụng tiếp.");
    return accessToken;
  }

  Future<String?> refreshToken() async {
    try {
      final savedRefreshToken = await storage.getRefreshToken();

      if (savedRefreshToken == null || savedRefreshToken.isEmpty) {
        await storage.clearToken();
        return null;
      }

      final request = RefreshTokenRequest(
        refreshToken: savedRefreshToken,
        platform: "MOBILE",
      );

      // Tạo một Dio trần trụi, sạch sẽ tuyệt đối
      final cleanDio = dio_package.Dio(dio_package.BaseOptions(
        baseUrl: service.dio.options.baseUrl, // Dùng chung baseUrl với hệ thống
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
      ));

      // Không gắn token cũ
      cleanDio.options.headers.remove('Authorization');

      // Bắn API qua cleanDio, né hoàn toàn Interceptor chung ra
      final res = await cleanDio.post(
        '/api/auth/refresh-token', // Điền chuẩn endpoint refresh token của backend bạn
        data: request.toJson(),
      );

      final data = res.data['data'];

      if (data is! Map<String, dynamic>) {
        throw Exception('Phản hồi đổi token không hợp lệ');
      }

      final tokenResponse = RefreshTokenResponse.fromJson(data);

      if (tokenResponse.accessToken == null || tokenResponse.accessToken!.isEmpty) {
        await storage.clearToken();
        return null;
      }

      // Lưu access token mới vào máy
      await storage.saveAccessToken(tokenResponse.accessToken!);

      print("🟢 [AuthRepository] Đã âm thầm gia hạn Token thành công!");
      return tokenResponse.accessToken;

    } catch (e) {
      debugPrint("🚨 Lỗi khi đang cố refresh token: $e");
      await storage.clearToken();
      return null;
    }
  }

  Future<AuthModel> login(LoginRequest request) async {
    final res = await service.login(request.toJson());

    final data = res.data['data'];

    if (data is! Map<String, dynamic>) {
      throw Exception('Phản hồi đăng nhập không hợp lệ');
    }

    final auth = AuthModel.fromJson(data);

    await storage.saveToken(auth.accessToken, auth.refreshToken);

    return auth;
  }

  Future<UserModel> getMe () async {
    final res = await service.getMe();

    return UserModel.fromJson(res.data['data']);
  }

  Future<void> logout() async {

    await storage.clearAll();
  }

  Future<RegisterResponse> register(RegisterRequest request) async {
    final res = await service.register(request.toJson());

    final data = res.data['data'];
    if (data is! Map<String, dynamic>) {
      throw Exception('Phản hồi đăng ký không hợp lệ');
    }

    return RegisterResponse.fromJson(data);
  }
}
