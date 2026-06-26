import 'package:dio/dio.dart';

class AuthService {
  final Dio dio;

  AuthService(this.dio);

  Future<Response> login(Map<String, dynamic> data) async {
    return await dio.post('/api/auth/login', data: data);
  }

  Future<Response> getMe () async {
    print("=== GET ME ===");
    print("Headers: ${dio.options.headers}");

    return await dio.get('/api/auth/me');
  }
}