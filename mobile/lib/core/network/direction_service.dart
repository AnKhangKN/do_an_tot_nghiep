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
  final Dio _dio = Dio();

  /// Lấy tuyến đường, khoảng cách và ETA từ OSRM
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
      debugPrint("🚨 Lỗi lấy tuyến đường OSRM: $e");
    }
    return null;
  }

  /// Giữ lại method cũ để không break các màn hình đang dùng
  Future<List<LatLng>> getRoute(LatLng start, LatLng end) async {
    final info = await getRouteInfo(start, end);
    return info?.points ?? [];
  }
}
