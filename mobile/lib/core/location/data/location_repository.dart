import 'package:geolocator/geolocator.dart';

class LocationRepository {
  /// Check quyền truy cập vị trí
  Future<bool> ensureLocationPermission() async {
    // Kiểm tra GPS
    final serviceEnabled =
    await Geolocator.isLocationServiceEnabled();

    if (!serviceEnabled) {
      print("⚠️ GPS đang tắt");

      await Geolocator.openLocationSettings();

      return false;
    }

    var permission = await Geolocator.checkPermission();

    // Chưa cấp quyền
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();

      if (permission == LocationPermission.denied) {
        print("❌ Người dùng từ chối quyền vị trí");
        return false;
      }
    }

    // Từ chối vĩnh viễn
    if (permission == LocationPermission.deniedForever) {
      print("❌ Quyền vị trí bị chặn vĩnh viễn");

      await Geolocator.openAppSettings();

      return false;
    }

    return true;
  }

  /// Hàm lấy vị trí hiện tại sau khi đã check quyền
  Future<Position?> getCurrentLocation() async {
    try {
      bool hasPermission = await ensureLocationPermission();
      if (!hasPermission) return null;

      // Lấy vị trí hiện tại với độ chính xác cao
      return await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
    } catch (e) {
      print("❌ Lỗi khi lấy vị trí: $e");
      return null;
    }
  }
}