import 'package:dio/dio.dart';

class AuthService {
  final Dio dio;

  AuthService(this.dio);

  Future<Response> login(Map<String, dynamic> data) async {
    return await dio.post('/auth/login', data: data);
  }
}