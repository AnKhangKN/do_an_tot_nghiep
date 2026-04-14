import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:mobile/core/constants/app_constants.dart';

class MapScreen extends StatelessWidget {
  const MapScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('OpenStreetMap'),
      ),
      body: FlutterMap(
        options: MapOptions(
          initialCenter: LatLng(10.0452, 105.7469), // 📍 Cần Thơ
          initialZoom: 13,
        ),
        children: [
          TileLayer(
            urlTemplate: AppConstants.urlTemplate,
            userAgentPackageName: 'com.example.mobile',
          ),

          MarkerLayer(
            markers: [
              Marker(
                point: LatLng(10.0452, 105.7469),
                width: 50,
                height: 50,
                child: const Icon(
                  Icons.location_pin,
                  color: Colors.red,
                  size: 40,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}