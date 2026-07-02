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

  /// Lấy vị trí hiện tại
  Future<Position?> getCurrentPosition() async {
    try {
      final granted = await ensureLocationPermission();

      if (!granted) return null;

      return await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.best,
      );
    } catch (e) {
      debugPrint('Get current position error: $e');
      return null;
    }
  }

  /// Stream vị trí realtime
  Stream<Position> getPositionStream() {
    return Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.bestForNavigation,
        distanceFilter: 20, // chỉ cập nhật khi di chuyển >= 20m
      ),
    );
  }
}