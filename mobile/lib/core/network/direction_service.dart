import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';

class DirectionService {
  final Dio _dio = Dio();

  Future<List<LatLng>> getRoute(LatLng start, LatLng end) async {
    try {
      final url = 'https://router.project-osrm.org/route/v1/driving/'
          '${start.longitude},${start.latitude};${end.longitude},${end.latitude}'
          '?overview=full&geometries=geojson';
      
      final response = await _dio.get(url);
      if (response.statusCode == 200) {
        final data = response.data;
        final routes = data['routes'] as List;
        if (routes.isNotEmpty) {
          final geometry = routes[0]['geometry'];
          final coordinates = geometry['coordinates'] as List;
          return coordinates.map((coord) {
            final lng = (coord[0] as num).toDouble();
            final lat = (coord[1] as num).toDouble();
            return LatLng(lat, lng);
          }).toList();
        }
      }
    } catch (e) {
      debugPrint("🚨 Lỗi lấy tuyến đường OSRM: $e");
    }
    return [];
  }
}
