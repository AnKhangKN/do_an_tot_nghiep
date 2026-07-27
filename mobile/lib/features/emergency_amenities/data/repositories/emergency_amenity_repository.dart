import '../models/amenity_category_model.dart';
import '../models/emergency_amenity_model.dart';
import '../services/emergency_amenity_service.dart';

class EmergencyAmenityRepository {
  final EmergencyAmenityService service;

  EmergencyAmenityRepository(this.service);

  Future<List<AmenityCategoryModel>> getCategories() async {
    try {
      final response = await service.getCategories();
      if (response.data != null && response.data['success'] == true) {
        final List list = response.data['data'] ?? [];
        return list.map((item) => AmenityCategoryModel.fromJson(item)).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  Future<List<EmergencyAmenityModel>> getApprovedAmenities({String? categoryId}) async {
    try {
      final response = await service.getApprovedAmenities(categoryId: categoryId);
      if (response.data != null && response.data['success'] == true) {
        final List list = response.data['data'] ?? [];
        return list.map((item) => EmergencyAmenityModel.fromJson(item)).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  Future<bool> createAmenity({
    required String amenityCategoryId,
    required double latitude,
    required double longitude,
    String? phone,
    String? openingHours,
    String? imagePath,
  }) async {
    try {
      final response = await service.createAmenity(
        amenityCategoryId: amenityCategoryId,
        latitude: latitude,
        longitude: longitude,
        phone: phone,
        openingHours: openingHours,
        imagePath: imagePath,
      );
      return response.data != null && response.data['success'] == true;
    } catch (e) {
      return false;
    }
  }

  Future<bool> sendFeedback({
    required String amenityId,
    required String reason,
    String? comment,
  }) async {
    try {
      final response = await service.sendFeedback(
        amenityId: amenityId,
        reason: reason,
        comment: comment,
      );
      return response.data != null && response.data['success'] == true;
    } catch (e) {
      return false;
    }
  }
}


