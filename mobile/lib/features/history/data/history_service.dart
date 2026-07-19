import 'package:dio/dio.dart';

class HistoryService {
  final Dio dio;

  HistoryService(this.dio);

  Future<Response> getHistory() async {
    return await dio.get('/api/sos/sos_requests/history');
  }
}
