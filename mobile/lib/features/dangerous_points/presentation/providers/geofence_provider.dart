import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import '../../../../core/di/di.dart';
import '../../../../core/dangerous_points/data/dangerous_point_repository.dart';
import '../../../../core/dangerous_points/models/dangerous_point_model.dart';
import '../../../settings/presentation/providers/settings_provider.dart';

class GeofenceProvider with ChangeNotifier {
  final DangerousPointRepository repository;

  GeofenceProvider({DangerousPointRepository? repository})
      : repository = repository ?? getIt<DangerousPointRepository>();

  List<DangerousPointModel> _approvedPoints = [];
  List<DangerousPointModel> get approvedPoints => _approvedPoints;

  List<DangerousPointModel> _myPoints = [];
  List<DangerousPointModel> get myPoints => _myPoints;

  DangerousPointModel? _activeAlertPoint;
  DangerousPointModel? get activeAlertPoint => _activeAlertPoint;

  double? _activeAlertDistanceMeters;
  double? get activeAlertDistanceMeters => _activeAlertDistanceMeters;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  bool _isLoadingMyPoints = false;
  bool get isLoadingMyPoints => _isLoadingMyPoints;

  /// Tải danh sách điểm cảnh báo do chính người dùng tạo
  Future<void> fetchMyPoints() async {
    _isLoadingMyPoints = true;
    notifyListeners();

    try {
      _myPoints = await repository.getMyDangerousPoints();
    } catch (e) {
      debugPrint('⚠️ [GEOFENCE] Lỗi tải điểm cảnh báo cá nhân: $e');
    } finally {
      _isLoadingMyPoints = false;
      notifyListeners();
    }
  }

  // Cờ đánh dấu đã hiển thị cảnh báo pop-up 1 lần khi mở app (tránh spam)
  bool _hasShownSessionAlert = false;
  bool get hasShownSessionAlert => _hasShownSessionAlert;

  /// Tải danh sách điểm nguy hiểm đã duyệt từ backend và tự động kiểm tra vị trí hiện tại nếu có
  Future<void> loadApprovedPoints({double? userLat, double? userLng}) async {
    _isLoading = true;
    notifyListeners();

    try {
      final rawPoints = await repository.getApprovedDangerousPoints();
      _approvedPoints = rawPoints.where((pt) => pt.isEligibleToShow).toList();
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

  // Thời điểm phát cảnh báo gần nhất để xử lý Cooldown tránh spam
  DateTime? _lastAlertTime;
  DateTime? get lastAlertTime => _lastAlertTime;

  // Thời gian Cooldown giữa các lần cảnh báo (mặc định 10 phút)
  static const Duration alertCooldownDuration = Duration(minutes: 10);

  /// Kiểm tra vị trí hiện tại với danh sách vùng nguy hiểm (Bán kính động & Cooldown 10 phút)
  void checkGeofence(double userLat, double userLng) {
    // Kiểm tra cấu hình cài đặt: Nếu người dùng TẮT cảnh báo vùng nguy hiểm -> Bỏ qua
    final settingsProvider = getIt<SettingsProvider>();
    if (!settingsProvider.notifyHazard) return;

    if (_approvedPoints.isEmpty) return;

    // Kiểm tra Cooldown: Nếu vừa cảnh báo trong vòng 10 phút -> Bỏ qua tránh spam
    if (_lastAlertTime != null) {
      final elapsed = DateTime.now().difference(_lastAlertTime!);
      if (elapsed < alertCooldownDuration) {
        return;
      }
    }

    for (final point in _approvedPoints) {
      final distanceInMeters = Geolocator.distanceBetween(
        userLat,
        userLng,
        point.latitude,
        point.longitude,
      );

      // Bán kính cảnh báo linh hoạt theo cấp độ nguy hiểm
      double triggerRadiusMeters = 500.0;
      final level = point.dangerLevel.toUpperCase();
      if (level == 'HIGH') {
        triggerRadiusMeters = 500.0;
      } else if (level == 'MEDIUM') {
        triggerRadiusMeters = 350.0;
      } else if (level == 'LOW') {
        triggerRadiusMeters = 200.0;
      }

      // Nếu đi vào trong bán kính cảnh báo của điểm nguy hiểm
      if (distanceInMeters <= triggerRadiusMeters) {
        _lastAlertTime = DateTime.now(); // Ghi nhận thời điểm phát cảnh báo (bắt đầu cooldown 10 phút)
        _hasShownSessionAlert = true;
        _activeAlertPoint = point;
        _activeAlertDistanceMeters = distanceInMeters;
        debugPrint(
          '🚨 [GEOFENCE ALERT] Phát hiện điểm nguy hiểm ${point.zoneName} (${distanceInMeters.toStringAsFixed(0)}m / bán kính ${triggerRadiusMeters.toStringAsFixed(0)}m)',
        );
        notifyListeners();
        break; // Chỉ bật cảnh báo cho điểm gần nhất
      }
    }
  }

  /// Đóng cảnh báo hiện tại
  void dismissAlert() {
    _activeAlertPoint = null;
    _activeAlertDistanceMeters = null;
    notifyListeners();
  }

  /// Reset lại cờ phiên nếu cần
  void resetSessionAlert() {
    _hasShownSessionAlert = false;
    _lastAlertTime = null;
    _activeAlertPoint = null;
    _activeAlertDistanceMeters = null;
    notifyListeners();
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

  /// Reset toàn bộ state về trạng thái ban đầu khi đăng xuất (không giữ dữ liệu tài khoản cũ).
  void reset() {
    _approvedPoints = [];
    _myPoints = [];
    _activeAlertPoint = null;
    _activeAlertDistanceMeters = null;
    _lastAlertTime = null;
    _hasShownSessionAlert = false;
    _isLoading = false;
    _isLoadingMyPoints = false;
    notifyListeners();
  }
}
