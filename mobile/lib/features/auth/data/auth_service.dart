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
}