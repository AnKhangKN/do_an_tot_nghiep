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

  Future<Response> getMe () async {
    return await dio.get('/api/auth/me');
  }

  Future<Response> register(Map<String, dynamic> data) async {
    return await dio.post('/api/auth/register', data: data);
  }

  Future<Response> registerDeviceToken(Map<String, dynamic> data) async {
    return await dio.post('/api/device_tokens', data: data);
  }
}