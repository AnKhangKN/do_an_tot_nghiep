import 'package:dio/dio.dart';

import '../models/rescuer_register_request.dart';

class RescuerService {
  final Dio dio;

  RescuerService(this.dio);

  Future<void> registerRescuer(RescuerRegisterRequest request) async {
    await dio.post('/api/rescuer/register', data: request.toJson());
  }
}
