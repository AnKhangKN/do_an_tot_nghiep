import 'package:dio/dio.dart';

class VictimService {
  final Dio dio;

  VictimService(this.dio);

  Future<Response> sendSos(Map<String, dynamic> data, {String? imagePath}) async {
    if (imagePath != null && imagePath.isNotEmpty) {
      final fileName = imagePath.split('/').last;
      data['image'] = await MultipartFile.fromFile(
        imagePath,
        filename: fileName,
      );
      final formData = FormData.fromMap(data);
      return dio.post('/api/sos/sos_requests', data: formData);
    }
    return dio.post('/api/sos/sos_requests', data: data);
  }


  Future<Response> cancelSos({String? sosRequestId, String? cancelReason}) async {
    return dio.post('/api/sos/sos_requests/cancel', data: {
      if (sosRequestId != null) 'sosRequestId': sosRequestId,
      'cancelReason': cancelReason ?? 'Nạn nhân chủ động hủy yêu cầu',
    });
  }

  Future<Response> submitPostRescueCheckin({
    required String sosRequestId,
    required String healthStatus,
    String? checkinNotes,
    int? rating,
    int? responseSpeed,
    int? attitude,
    int? supportLevel,
    String? comment,
  }) async {
    return dio.post('/api/sos/sos_requests/post-rescue-checkin', data: {
      'sosRequestId': sosRequestId,
      'healthStatus': healthStatus,
      'checkinNotes': checkinNotes,
      'rating': rating,
      if (responseSpeed != null) 'responseSpeed': responseSpeed,
      if (attitude != null) 'attitude': attitude,
      if (supportLevel != null) 'supportLevel': supportLevel,
      'comment': comment,
    });
  }
}
