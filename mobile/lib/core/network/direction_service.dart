import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';

/// Kết quả trả về từ OSRM bao gồm điểm đường, khoảng cách và thời gian ước tính
class RouteInfo {
  final List<LatLng> points;
  final double distanceKm;   // Khoảng cách (km)
  final int durationSec;     // Thời gian di chuyển ước tính (giây)

  const RouteInfo({
    required this.points,
    required this.distanceKm,
    required this.durationSec,
  });
}

class DirectionService {
  final Dio _dio = Dio(
    BaseOptions(
      connectTimeout: const Duration(seconds: 5),
      receiveTimeout: const Duration(seconds: 5),
    ),
  );

  /// Lấy tuyến đường, khoảng cách và ETA từ OSRM (Có fallback đường chim bay nếu OSRM lỗi)
  Future<RouteInfo?> getRouteInfo(LatLng start, LatLng end) async {
    try {
      final url = 'https://router.project-osrm.org/route/v1/driving/'
          '${start.longitude},${start.latitude};${end.longitude},${end.latitude}'
          '?overview=full&geometries=geojson';

      final response = await _dio.get(url);
      if (response.statusCode == 200) {
        final data = response.data;
        final routes = data['routes'] as List;
        if (routes.isNotEmpty) {
          final route = routes[0];
          final geometry = route['geometry'];
          final coordinates = geometry['coordinates'] as List;

          final points = coordinates.map((coord) {
            final lng = (coord[0] as num).toDouble();
            final lat = (coord[1] as num).toDouble();
            return LatLng(lat, lng);
          }).toList();

          // OSRM trả về distance (mét) và duration (giây)
          final distanceM = (route['distance'] as num).toDouble();
          final durationSec = (route['duration'] as num).toInt();

          return RouteInfo(
            points: points,
            distanceKm: distanceM / 1000.0,
            durationSec: durationSec,
          );
        }
      }
    } catch (e) {
      debugPrint("🚨 Lỗi lấy tuyến đường OSRM (Sử dụng fallback): $e");
    }

    // Fallback: Tính khoảng cách đường chim bay khi không gọi được OSRM
    return _getFallbackRoute(start, end);
  }

  /// Tính tuyến đường dự phòng (đường chim bay) khi mất mạng/OSRM server quá tải
  RouteInfo _getFallbackRoute(LatLng start, LatLng end) {
    const distanceCalculator = Distance();
    final distanceM = distanceCalculator.as(LengthUnit.Meter, start, end);
    final distanceKm = distanceM / 1000.0;
    // Ước tính vận tốc trung bình di chuyển cứu hộ ~ 30 km/h (8.33 m/s)
    final durationSec = (distanceM / 8.33).round();

    return RouteInfo(
      points: [start, end],
      distanceKm: distanceKm,
      durationSec: durationSec > 0 ? durationSec : 30,
    );
  }

  /// Giữ lại method cũ để không break các màn hình đang dùng
  Future<List<LatLng>> getRoute(LatLng start, LatLng end) async {
    final info = await getRouteInfo(start, end);
    return info?.points ?? [];
  }

  /// Format khoảng cách hiển thị (VD: "450 m" hoặc "2.3 km")
  static String formatDistance(double distanceKm) {
    if (distanceKm < 1.0) {
      final meters = (distanceKm * 1000).round();
      return meters < 10 ? "< 10 m" : "$meters m";
    }
    return "${distanceKm.toStringAsFixed(1)} km";
  }

  /// Format thời gian di chuyển (ETA) hiển thị
  static String formatDuration(int seconds) {
    if (seconds < 60) return "< 1 phút";
    final minutes = seconds ~/ 60;
    if (minutes < 60) return "$minutes phút";
    final hours = minutes ~/ 60;
    final remainMins = minutes % 60;
    return remainMins > 0 ? "$hours giờ $remainMins ph" : "$hours giờ";
  }
}
