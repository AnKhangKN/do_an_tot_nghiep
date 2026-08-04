import '../models/dangerous_point_model.dart';
import 'dangerous_point_service.dart';

class DangerousPointRepository {
  final DangerousPointService dangerousPointService;

  DangerousPointRepository(this.dangerousPointService);

  Future<DangerousPointModel> createDangerousPoint({
    required String zoneName,
    String? description,
    required double latitude,
    required double longitude,
    required String dangerLevel,
    String? imagePath,
  }) async {
    final res = await dangerousPointService.createDangerousPoint({
      'zoneName': zoneName,
      'description': description,
      'latitude': latitude,
      'longitude': longitude,
      'dangerLevel': dangerLevel,
      if (imagePath != null) 'imagePath': imagePath,
    });

    return DangerousPointModel.fromJson(res.data['data']);
  }

  Future<List<DangerousPointModel>> getApprovedDangerousPoints() async {
    final res = await dangerousPointService.getApprovedDangerousPoints();

    final List data = res.data['data'];

    return data
        .map((e) => DangerousPointModel.fromJson(e))
        .toList();
  }

  Future<List<DangerousPointModel>> getMyDangerousPoints() async {
    final res = await dangerousPointService.getMyDangerousPoints();

    final List data = res.data['data'] ?? [];

    return data
        .map((e) => DangerousPointModel.fromJson(e))
        .toList();
  }

  Future<Map<String, dynamic>> submitFeedback({
    required String pointId,
    required String feedbackType,
    String? comment,
  }) async {
    final res = await dangerousPointService.submitFeedback(pointId, feedbackType, comment: comment);
    return res.data['data'] ?? {};
  }

  Future<Map<String, dynamic>> getPointFeedbacks(String pointId) async {
    final res = await dangerousPointService.getPointFeedbacks(pointId);
    return res.data['data'] ?? {};
  }
}
