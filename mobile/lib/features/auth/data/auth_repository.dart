import 'dart:io' show Platform;
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

    if (accessToken == null || accessToken.isEmpty) {
      return null;
    }

    // In log kiểm tra thời gian còn lại của Access Token
    try {
      final DateTime expDate = JwtDecoder.getExpirationDate(accessToken);
      final Duration remaining = expDate.difference(DateTime.now());
      final Map<String, dynamic> decoded = JwtDecoder.decode(accessToken);
      final bool isGuest = decoded['isGuest'] == true;
      final String userType = isGuest ? "Tài khoản Khách (Guest)" : "Tài khoản thường";

      if (remaining.isNegative) {
        debugPrint("⏰ [AuthRepository] Access Token ($userType) ĐÃ HẾT HẠN từ ${(remaining.abs().inSeconds)} giây trước!");
      } else {
        final int mins = remaining.inMinutes;
        final int secs = remaining.inSeconds % 60;
        final String timeStr = "${expDate.hour.toString().padLeft(2, '0')}:${expDate.minute.toString().padLeft(2, '0')}:${expDate.second.toString().padLeft(2, '0')}";
        debugPrint("⏱️ [AuthRepository] Access Token ($userType) còn hiệu lực: $mins phút $secs giây (Hết hạn lúc $timeStr)");
      }
    } catch (e) {
      debugPrint("⚠️ [AuthRepository] Lỗi đọc thời gian Token: $e");
    }

    // 2. Kiểm tra nếu là Token Khách (Guest) và đã hết hạn -> Đăng xuất ngay lập tức
    try {
      final Map<String, dynamic> decoded = JwtDecoder.decode(accessToken);
      if (decoded['isGuest'] == true) {
        if (JwtDecoder.isExpired(accessToken)) {
          debugPrint("🎯 [AuthRepository] Token Khách tạm thời đã hết hạn 5 phút -> Đăng xuất người dùng về LoginScreen.");
          await storage.clearToken();
          return null;
        } else {
          return accessToken;
        }
      }
    } catch (e) {
      debugPrint("⚠️ [AuthRepository] Lỗi giải mã JWT Token: $e");
    }

    // 3. Đối với tài khoản thường: Kiểm tra nếu token đã hết hạn -> Tự động gia hạn ngầm
    if (JwtDecoder.isExpired(accessToken)) {
      debugPrint("🎯 [AuthRepository] Token hết hạn. Đang tự động refresh token mới...");
      final newAccessToken = await refreshToken();
      return newAccessToken;
    }

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
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
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

  Future<AuthModel> loginWithGoogle({
    required String email,
    required String providerId,
    String? fullName,
    String? avatarUrl,
    String? idToken,
  }) async {
    final res = await service.loginWithGoogle({
      'email': email,
      'providerId': providerId,
      'fullName': fullName,
      'avatarUrl': avatarUrl,
      'idToken': idToken,
    });

    final data = res.data['data'];

    if (data is! Map<String, dynamic>) {
      throw Exception('Phản hồi đăng nhập Google không hợp lệ');
    }

    final auth = AuthModel.fromJson(data);

    await storage.saveToken(auth.accessToken, auth.refreshToken);

    return auth;
  }

  Future<AuthModel> guestLogin({required String phone, String? fullName}) async {
    final res = await service.guestLogin({
      'phone': phone,
      'fullName': fullName ?? 'Nạn nhân Khách',
    });

    final data = res.data['data'];

    if (data is! Map<String, dynamic>) {
      throw Exception('Phản hồi xác thực khách không hợp lệ');
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

  Future<AuthModel> verifyOtp({required String email, required String otpCode}) async {
    final res = await service.verifyOtp({
      'email': email,
      'otpCode': otpCode,
    });

    final data = res.data['data'];
    if (data is! Map<String, dynamic>) {
      throw Exception('Phản hồi xác thực OTP không hợp lệ');
    }

    return AuthModel.fromJson(data);
  }

  Future<void> resendOtp({required String email}) async {
    await service.resendOtp({'email': email});
  }

  Future<void> forgotPassword({required String email}) async {
    await service.forgotPassword({'email': email});
  }

  Future<void> resetPassword({
    required String email,
    required String otpCode,
    required String newPassword,
    required String confirmPassword,
  }) async {
    await service.resetPassword({
      'email': email,
      'otpCode': otpCode,
      'newPassword': newPassword,
      'confirmPassword': confirmPassword,
    });
  }

  Future<void> registerDeviceToken(String token) async {
    try {
      final validToken = await getValidAccessToken();
      if (validToken == null) {
        debugPrint("⚠️ [AuthRepository] Không có token hợp lệ để đăng ký thiết bị.");
        return;
      }

      String platformName = "ANDROID";
      if (Platform.isIOS) {
        platformName = "IOS";
      }

      final data = {
        "token": token,
        "platform": platformName,
      };

      await service.registerDeviceToken(data);
      debugPrint("🟢 [AuthRepository] Đăng ký FCM token lên Server thành công ($platformName)");
    } on dio_package.DioException catch (e) {
      if (e.type == dio_package.DioExceptionType.connectionTimeout ||
          e.type == dio_package.DioExceptionType.receiveTimeout) {
        debugPrint("⚠️ [AuthRepository] Đăng ký FCM token bị quá thời gian kết nối (timeout). Sẽ tự động thử lại ở lần khởi động sau.");
      } else {
        debugPrint("🚨 [AuthRepository] Lỗi đăng ký thiết bị: ${e.message}");
      }
    } catch (e) {
      debugPrint("🚨 [AuthRepository] Lỗi đăng ký thiết bị: $e");
    }
  }

  /// Hủy đăng ký FCM token cũ khỏi server (best-effort, lỗi thì bỏ qua) trước khi xóa token local.
  Future<void> unregisterDeviceToken(String token) async {
    try {
      final validToken = await getValidAccessToken();
      if (validToken == null) {
        debugPrint("⚠️ [AuthRepository] Không có token hợp lệ để hủy đăng ký thiết bị.");
        return;
      }
      await service.unregisterDeviceToken({"token": token});
      debugPrint("🟢 [AuthRepository] Hủy đăng ký FCM token lên Server thành công.");
    } catch (e) {
      debugPrint("🚨 [AuthRepository] Lỗi hủy đăng ký thiết bị: $e");
    }
  }

  Future<void> appealBan({String? email, required String reason}) async {
    try {
      if (email != null && email.isNotEmpty) {
        await service.appealBanPublic({'email': email, 'reason': reason});
      } else {
        await service.appealBan({'reason': reason});
      }
    } catch (e) {
      debugPrint("🚨 [AuthRepository] Lỗi gửi kháng cáo: $e");
      rethrow;
    }
  }

  Future<Map<String, dynamic>?> checkAppealStatus(String email) async {
    try {
      final res = await service.checkAppealStatus({'email': email});
      final data = res.data['data'];
      if (data == null) return null;
      return Map<String, dynamic>.from(data);
    } catch (e) {
      debugPrint("🚨 [AuthRepository] Lỗi kiểm tra trạng thái kháng cáo: $e");
      return null;
    }
  }

  Future<Map<String, dynamic>?> getActiveSOS() async {
    try {
      final res = await service.getActiveSOS();
      final data = res.data['data'];
      if (data == null) return null;
      return Map<String, dynamic>.from(data);
    } catch (e) {
      debugPrint("🚨 [AuthRepository] Lỗi lấy ca cứu hộ hiện tại: $e");
      return null;
    }
  }
}
