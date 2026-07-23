import '../models/dangerous_point_model.dart';
import 'dangerous_point_service.dart';

class DangerousPointRepository {
  final DangerousPointService dangerousPointService;

  DangerousPointRepository(this.dangerousPointService);

  Future<DangerousPointModel> createDangerousPoint({
    required String zoneName,
    String? address,
    String? description,
    required double latitude,
    required double longitude,
    required String dangerLevel,
  }) async {
    final res = await dangerousPointService.createDangerousPoint({
      'zoneName': zoneName,
      'address': address,
      'description': description,
      'latitude': latitude,
      'longitude': longitude,
      'dangerLevel': dangerLevel,
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
}
