import 'package:dio/dio.dart';

class IncidentTypeService {
  final Dio dio;

  IncidentTypeService(this.dio);

  Future<Response> getIncidentTypes() async {
    final res = await dio.get('/api/incident_types');
    return res;
  }
}