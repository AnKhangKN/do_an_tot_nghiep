import 'package:dio/dio.dart';

class UserService {
  final Dio dio;

  UserService(this.dio);

  Future<Response> getProfile() async {
    final res = await dio.get('/api/users');
    return res;
  }

  Future<Response> uploadAvatar(String imagePath) async {
    final fileName = imagePath.split('/').last;
    final formData = FormData.fromMap({
      'avatar': await MultipartFile.fromFile(
        imagePath,
        filename: fileName,
      ),
    });
    final res = await dio.patch('/api/users/avatar', data: formData);
    return res;
  }
}