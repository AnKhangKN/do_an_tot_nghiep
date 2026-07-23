import 'package:dio/dio.dart';

class DangerousPointService {
  final Dio dio;

  DangerousPointService(this.dio);

  Future<Response> createDangerousPoint(Map<String, dynamic> data) async {
    final res = await dio.post(
      '/api/dangerous_points',
      data: data,
    );
    return res;
  }

  Future<Response> getApprovedDangerousPoints() async {
    final res = await dio.get('/api/dangerous_points/approved');
    return res;
  }
}
