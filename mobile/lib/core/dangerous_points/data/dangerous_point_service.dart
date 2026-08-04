import 'package:dio/dio.dart';
import '../../constants/api_endpoints.dart';

class DangerousPointService {
  final Dio dio;

  DangerousPointService(this.dio);

  Future<Response> createDangerousPoint(Map<String, dynamic> data) async {
    final String? imagePath = data['imagePath']?.toString();

    if (imagePath != null && imagePath.isNotEmpty && !imagePath.startsWith('http')) {
      final formDataMap = <String, dynamic>{
        'zoneName': data['zoneName'],
        'latitude': data['latitude'].toString(),
        'longitude': data['longitude'].toString(),
        'dangerLevel': data['dangerLevel'],
        'image': await MultipartFile.fromFile(
          imagePath,
          filename: imagePath.split('/').last,
        ),
      };

      if (data['description'] != null && data['description'].toString().isNotEmpty) {
        formDataMap['description'] = data['description'];
      }

      final formData = FormData.fromMap(formDataMap);

      return await dio.post(
        ApiEndpoints.dangerousPoints,
        data: formData,
      );
    } else {
      return await dio.post(
        ApiEndpoints.dangerousPoints,
        data: data,
      );
    }
  }

  Future<Response> getApprovedDangerousPoints() async {
    final res = await dio.get(ApiEndpoints.dangerousPointsApproved);
    return res;
  }

  Future<Response> getMyDangerousPoints() async {
    final res = await dio.get(ApiEndpoints.myDangerousPoints);
    return res;
  }

  Future<Response> submitFeedback(String pointId, String feedbackType, {String? comment}) async {
    final res = await dio.post(
      '/api/dangerous_points/$pointId/feedbacks',
      data: {
        'feedbackType': feedbackType,
        'comment': comment,
      },
    );
    return res;
  }

  Future<Response> getPointFeedbacks(String pointId) async {
    final res = await dio.get('/api/dangerous_points/$pointId/feedbacks');
    return res;
  }
}
