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
