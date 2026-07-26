import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';

class LocationService {
  /// Kiểm tra GPS và quyền truy cập vị trí
  Future<bool> ensureLocationPermission() async {
    final serviceEnabled =
    await Geolocator.isLocationServiceEnabled();

    if (!serviceEnabled) {
      debugPrint('Location service is disabled');
      await Geolocator.openLocationSettings();
      return false;
    }

    LocationPermission permission =
    await Geolocator.checkPermission();

    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();

      if (permission == LocationPermission.denied) {
        debugPrint('Location permission denied');
        return false;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      debugPrint('Location permission denied forever');
      await Geolocator.openAppSettings();
      return false;
    }

    return true;
  }

  /// Lấy vị trí hiện tại với fallback nhanh từ vị trí đã biết gần nhất
  Future<Position?> getCurrentPosition() async {
    try {
      final granted = await ensureLocationPermission();
      if (!granted) return null;

      // 1. Lấy vị trí đã biết gần nhất trước để nhanh chóng (dưới 10ms)
      final lastKnown = await Geolocator.getLastKnownPosition();
      if (lastKnown != null) {
        return lastKnown;
      }

      // 2. Nếu chưa có, lấy vị trí hiện tại với timeLimit 4 giây tránh treo app
      return await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.medium,
        timeLimit: const Duration(seconds: 4),
      );
    } catch (e) {
      debugPrint('Get current position error: $e');
      return null;
    }
  }

  /// Lấy vị trí GPS phần cứng thực tế mới nhất (bỏ qua cache, đọc trực tiếp từ sensor GPS)
  Future<Position?> getFreshPosition() async {
    try {
      final granted = await ensureLocationPermission();
      if (!granted) return null;

      return await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 5),
      );
    } catch (e) {
      debugPrint('Get fresh position error: $e');
      return await Geolocator.getLastKnownPosition();
    }
  }

  /// Stream vị trí realtime với distanceFilter cấu hình động (mặc định là 10m)
  Stream<Position> getPositionStream({int distanceFilter = 10}) {
    LocationSettings locationSettings;
    if (defaultTargetPlatform == TargetPlatform.android) {
      locationSettings = AndroidSettings(
        accuracy: LocationAccuracy.bestForNavigation,
        distanceFilter: distanceFilter,
        intervalDuration: const Duration(seconds: 1), // Quét định vị mỗi 1 giây để di chuyển liên tục
      );
    } else if (defaultTargetPlatform == TargetPlatform.iOS || defaultTargetPlatform == TargetPlatform.macOS) {
      locationSettings = AppleSettings(
        accuracy: LocationAccuracy.bestForNavigation,
        distanceFilter: distanceFilter,
        activityType: ActivityType.otherNavigation,
        pauseLocationUpdatesAutomatically: false,
      );
    } else {
      locationSettings = LocationSettings(
        accuracy: LocationAccuracy.bestForNavigation,
        distanceFilter: distanceFilter,
      );
    }

    return Geolocator.getPositionStream(locationSettings: locationSettings);
  }
}