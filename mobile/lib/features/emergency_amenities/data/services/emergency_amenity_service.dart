import 'package:dio/dio.dart';
import '../../../../core/constants/api_endpoints.dart';

class EmergencyAmenityService {
  final Dio dio;

  EmergencyAmenityService(this.dio);

  Future<Response> getCategories() async {
    return await dio.get(ApiEndpoints.amenityCategories);
  }

  Future<Response> getApprovedAmenities({String? categoryId}) async {
    return await dio.get(
      ApiEndpoints.approvedAmenities,
      queryParameters: categoryId != null && categoryId.isNotEmpty ? {'amenityCategoryId': categoryId} : null,
    );
  }

  Future<Response> createAmenity(Map<String, dynamic> data) async {
    return await dio.post(ApiEndpoints.emergencyAmenities, data: data);
  }
}
