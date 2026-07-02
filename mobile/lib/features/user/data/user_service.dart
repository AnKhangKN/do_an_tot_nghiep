import 'package:dio/dio.dart';

class UserService {
  final Dio dio;

  UserService(this.dio);

  Future<Response> getProfile() async {

    final res = await dio.get('/api/users');
    return res;
  }
}