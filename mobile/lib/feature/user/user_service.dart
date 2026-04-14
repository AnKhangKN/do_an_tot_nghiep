import 'package:dio/dio.dart';

class UserService {
  final Dio dio;

  UserService(this.dio);

  Future<Response> getProfile() async {

    final res = await dio.get('/users');
    return res;
  }
}