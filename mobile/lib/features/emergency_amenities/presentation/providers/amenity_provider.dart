import 'package:flutter/material.dart';
import '../../../../core/di/di.dart';
import '../../data/models/amenity_category_model.dart';
import '../../data/models/emergency_amenity_model.dart';
import '../../data/repositories/emergency_amenity_repository.dart';

import 'package:latlong2/latlong.dart';
import '../../../../core/network/direction_service.dart';

class AmenityProvider with ChangeNotifier {
  final EmergencyAmenityRepository repository;

  AmenityProvider({EmergencyAmenityRepository? repository})
      : repository = repository ?? getIt<EmergencyAmenityRepository>();

  List<AmenityCategoryModel> _categories = [];
  List<AmenityCategoryModel> get categories => _categories;

  List<EmergencyAmenityModel> _amenities = [];
  List<EmergencyAmenityModel> get amenities => _amenities;

  String? _selectedCategoryId;
  String? get selectedCategoryId => _selectedCategoryId;

  bool _isLoadingCategories = false;
  bool get isLoadingCategories => _isLoadingCategories;

  bool _isLoadingAmenities = false;
  bool get isLoadingAmenities => _isLoadingAmenities;

  bool _isSubmitting = false;
  bool get isSubmitting => _isSubmitting;

  // In-app navigation state
  EmergencyAmenityModel? _activeNavigationAmenity;
  List<LatLng> _routePoints = [];
  double? _routeDistanceKm;
  int? _routeDurationSec;
  bool _isNavigating = false;

  EmergencyAmenityModel? get activeNavigationAmenity => _activeNavigationAmenity;
  List<LatLng> get routePoints => _routePoints;
  double? get routeDistanceKm => _routeDistanceKm;
  int? get routeDurationSec => _routeDurationSec;
  bool get isNavigating => _isNavigating;

  Future<bool> startInAppNavigation({
    required double userLat,
    required double userLng,
    required EmergencyAmenityModel amenity,
  }) async {
    _activeNavigationAmenity = amenity;
    _isNavigating = true;
    notifyListeners();

    try {
      final start = LatLng(userLat, userLng);
      final end = LatLng(amenity.latitude, amenity.longitude);
      final info = await DirectionService().getRouteInfo(start, end);

      if (info != null && info.points.isNotEmpty) {
        _routePoints = info.points;
        _routeDistanceKm = info.distanceKm;
        _routeDurationSec = info.durationSec;
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('Error starting in-app navigation: $e');
    }
    return false;
  }

  void stopInAppNavigation() {
    _activeNavigationAmenity = null;
    _routePoints = [];
    _routeDistanceKm = null;
    _routeDurationSec = null;
    _isNavigating = false;
    notifyListeners();
  }

  Future<void> fetchCategories() async {
    _isLoadingCategories = true;
    notifyListeners();

    try {
      _categories = await repository.getCategories();
    } catch (e) {
      debugPrint('Error fetching amenity categories: $e');
    } finally {
      _isLoadingCategories = false;
      notifyListeners();
    }
  }

  Future<void> fetchAmenities({String? categoryId}) async {
    _isLoadingAmenities = true;
    _selectedCategoryId = categoryId;
    notifyListeners();

    try {
      _amenities = await repository.getApprovedAmenities(categoryId: categoryId);
    } catch (e) {
      debugPrint('Error fetching amenities: $e');
    } finally {
      _isLoadingAmenities = false;
      notifyListeners();
    }
  }

  void selectCategory(String? categoryId) {
    if (_selectedCategoryId == categoryId) {
      _selectedCategoryId = null;
    } else {
      _selectedCategoryId = categoryId;
    }
    fetchAmenities(categoryId: _selectedCategoryId);
  }

  Future<bool> addAmenity({
    required String amenityCategoryId,
    required double latitude,
    required double longitude,
    String? phone,
    String? openingHours,
  }) async {
    _isSubmitting = true;
    notifyListeners();

    try {
      final success = await repository.createAmenity(
        amenityCategoryId: amenityCategoryId,
        latitude: latitude,
        longitude: longitude,
        phone: phone,
        openingHours: openingHours,
      );

      if (success) {
        await fetchAmenities(categoryId: _selectedCategoryId);
      }
      return success;
    } catch (e) {
      return false;
    } finally {
      _isSubmitting = false;
      notifyListeners();
    }
  }
}
