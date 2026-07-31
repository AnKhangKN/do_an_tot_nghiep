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

  Future<Response> getMyAmenities() async {
    return await dio.get(ApiEndpoints.myAmenities);
  }

  Future<Response> createAmenity({
    required String amenityCategoryId,
    required double latitude,
    required double longitude,
    String? phone,
    String? openingHours,
    String? imagePath,
  }) async {
    final Map<String, dynamic> map = {
      'amenityCategoryId': amenityCategoryId,
      'latitude': latitude,
      'longitude': longitude,
      'phone': phone,
      'openingHours': openingHours ?? '07:00 - 21:00',
    };

    if (imagePath != null && imagePath.isNotEmpty) {
      final fileName = imagePath.split('/').last;
      map['image'] = await MultipartFile.fromFile(
        imagePath,
        filename: fileName,
      );
      final formData = FormData.fromMap(map);
      return await dio.post(ApiEndpoints.emergencyAmenities, data: formData);
    }

    return await dio.post(ApiEndpoints.emergencyAmenities, data: map);
  }

  Future<Response> sendFeedback({
    required String amenityId,
    required String reason,
    String? comment,
  }) async {
    return await dio.post(
      '${ApiEndpoints.emergencyAmenities}/$amenityId/feedback',
      data: {
        'reason': reason,
        'comment': comment,
      },
    );
  }
}


