import 'package:dio/dio.dart';

class VictimService {
  final Dio dio;

  VictimService(this.dio);

  Future<Response> sendSos(Map<String, dynamic> data) async {
    return dio.post('/api/sos/sos_requests', data: data);
  }
}
