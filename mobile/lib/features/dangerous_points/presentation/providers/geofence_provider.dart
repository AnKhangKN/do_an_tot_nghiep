import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import '../../../../core/di/di.dart';
import '../../../../core/dangerous_points/data/dangerous_point_repository.dart';
import '../../../../core/dangerous_points/models/dangerous_point_model.dart';

class GeofenceProvider with ChangeNotifier {
  final DangerousPointRepository repository;

  GeofenceProvider({DangerousPointRepository? repository})
      : repository = repository ?? getIt<DangerousPointRepository>();

  List<DangerousPointModel> _approvedPoints = [];
  List<DangerousPointModel> get approvedPoints => _approvedPoints;

  DangerousPointModel? _activeAlertPoint;
  DangerousPointModel? get activeAlertPoint => _activeAlertPoint;

  double? _activeAlertDistanceMeters;
  double? get activeAlertDistanceMeters => _activeAlertDistanceMeters;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  // Map lưu vết thời điểm đã cảnh báo gần nhất cho từng pointId (cooldown 10 phút)
  final Map<String, DateTime> _alertCooldowns = {};

  /// Tải danh sách điểm nguy hiểm đã duyệt từ backend và tự động kiểm tra vị trí hiện tại nếu có
  Future<void> loadApprovedPoints({double? userLat, double? userLng}) async {
    _isLoading = true;
    notifyListeners();

    try {
      _approvedPoints = await repository.getApprovedDangerousPoints();
      debugPrint('🛡️ [GEOFENCE] Đã tải ${_approvedPoints.length} điểm nguy hiểm đã duyệt');

      if (userLat != null && userLng != null) {
        checkGeofence(userLat, userLng);
      }
    } catch (e) {
      debugPrint('⚠️ [GEOFENCE] Lỗi tải điểm nguy hiểm: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Kiểm tra bán kính 500m với vị trí hiện tại của Nạn nhân
  void checkGeofence(double userLat, double userLng) {
    if (_approvedPoints.isEmpty) return;

    final now = DateTime.now();

    for (final point in _approvedPoints) {
      final distanceInMeters = Geolocator.distanceBetween(
        userLat,
        userLng,
        point.latitude,
        point.longitude,
      );

      // Nếu trong bán kính 500m
      if (distanceInMeters <= 500.0) {
        final lastAlert = _alertCooldowns[point.dangerousPointId];

        // Kiểm tra cooldown 10 phút
        if (lastAlert == null || now.difference(lastAlert).inMinutes >= 10) {
          _activeAlertPoint = point;
          _activeAlertDistanceMeters = distanceInMeters;
          _alertCooldowns[point.dangerousPointId] = now;
          debugPrint(
            '🚨 [GEOFENCE ALERT] Phát hiện điểm nguy hiểm: ${point.zoneName} (${distanceInMeters.toStringAsFixed(0)}m)',
          );
          notifyListeners();
          break; // Chỉ hiển thị 1 cảnh báo tại một thời điểm
        }
      }
    }
  }

  /// Lấy danh sách điểm nguy hiểm lân cận trong bán kính cân nhắc (mặc định 5km = 5000m)
  List<DangerousPointModel> getNearbyPoints(double? userLat, double? userLng, {double maxRadiusMeters = 5000.0}) {
    if (userLat == null || userLng == null || _approvedPoints.isEmpty) {
      return [];
    }

    final nearby = _approvedPoints.where((pt) {
      final dist = Geolocator.distanceBetween(
        userLat,
        userLng,
        pt.latitude,
        pt.longitude,
      );
      return dist <= maxRadiusMeters;
    }).toList();

    // Sắp xếp các điểm từ gần tới xa
    nearby.sort((a, b) {
      final distA = Geolocator.distanceBetween(userLat, userLng, a.latitude, a.longitude);
      final distB = Geolocator.distanceBetween(userLat, userLng, b.latitude, b.longitude);
      return distA.compareTo(distB);
    });

    return nearby;
  }

  /// Đóng cảnh báo hiện tại
  void dismissAlert() {
    _activeAlertPoint = null;
    _activeAlertDistanceMeters = null;
    notifyListeners();
  }
}
