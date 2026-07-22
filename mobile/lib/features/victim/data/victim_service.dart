import 'package:dio/dio.dart';

class VictimService {
  final Dio dio;

  VictimService(this.dio);

  Future<Response> sendSos(Map<String, dynamic> data) async {
    return dio.post('/api/sos/sos_requests', data: data);
  }

  Future<Response> cancelSos({String? sosRequestId, String? cancelReason}) async {
    return dio.post('/api/sos/sos_requests/cancel', data: {
      if (sosRequestId != null) 'sosRequestId': sosRequestId,
      'cancelReason': cancelReason ?? 'Nạn nhân chủ động hủy yêu cầu',
    });
  }
}
