import 'package:dio/dio.dart';

class AuthService {
  final Dio dio;

  AuthService(this.dio);

  Future<Response> refreshToken (Map<String, dynamic>  data) async {
    return await dio.post('/api/auth/refresh-token', data: data);
  }

  Future<Response> login(Map<String, dynamic> data) async {
    return await dio.post('/api/auth/login', data: data);
  }

  Future<Response> loginWithGoogle(Map<String, dynamic> data) async {
    return await dio.post('/api/auth/google', data: data);
  }

  Future<Response> guestLogin(Map<String, dynamic> data) async {
    return await dio.post('/api/auth/guest-login', data: data);
  }

  Future<Response> getMe () async {
    return await dio.get('/api/auth/me');
  }

  Future<Response> register(Map<String, dynamic> data) async {
    return await dio.post('/api/auth/register', data: data);
  }

  Future<Response> verifyOtp(Map<String, dynamic> data) async {
    return await dio.post('/api/auth/verify-otp', data: data);
  }

  Future<Response> resendOtp(Map<String, dynamic> data) async {
    return await dio.post('/api/auth/resend-otp', data: data);
  }

  Future<Response> registerDeviceToken(Map<String, dynamic> data) async {
    return await dio.post('/api/device_tokens', data: data);
  }

  Future<Response> unregisterDeviceToken(Map<String, dynamic> data) async {
    return await dio.delete('/api/device_tokens', data: data);
  }

  Future<Response> getActiveSOS() async {
    return await dio.get('/api/sos/sos_requests/active');
  }

  Future<Response> forgotPassword(Map<String, dynamic> data) async {
    return await dio.post('/api/auth/forgot-password', data: data);
  }

  Future<Response> resetPassword(Map<String, dynamic> data) async {
    return await dio.post('/api/auth/reset-password', data: data);
  }

  Future<Response> appealBan(Map<String, dynamic> data) async {
    return await dio.post('/api/auth/appeal-ban', data: data);
  }

  Future<Response> appealBanPublic(Map<String, dynamic> data) async {
    return await dio.post('/api/auth/appeal', data: data);
  }

  Future<Response> checkAppealStatus(Map<String, dynamic> data) async {
    return await dio.post('/api/auth/appeal-status', data: data);
  }
}