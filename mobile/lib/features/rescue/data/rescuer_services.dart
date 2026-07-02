import 'package:dio/dio.dart';

import '../models/register_rescuer_request.dart';

class RescuerServices {
  final Dio dio;

  RescuerServices(this.dio);

  Future<void> registerRescuer(RegisterRescuerRequest request) async {
    await dio.post('/api/rescuer/register', data: request.toJson());
  }
}
