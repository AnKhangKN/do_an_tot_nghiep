import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';
import 'package:mobile/shared/widgtes/UserMarkerWidget.dart';

import '../../core/constants/app_constants.dart';

class MapWidget extends StatelessWidget {
  final MapController mapController;
  final Position? position;

  const MapWidget({
    super.key,
    required this.mapController,
    required this.position,
  });

  @override
  Widget build(BuildContext context) {
    final initialLatLng = position != null
        ? LatLng(position!.latitude, position!.longitude)
        : const LatLng(10.0354, 105.7828);

    return FlutterMap(
      mapController: mapController,
      options: MapOptions(
        initialCenter: initialLatLng,
        initialZoom: position != null ? 15 : 13,
      ),
      children: [
        TileLayer(
          urlTemplate: AppConstants.urlTemplateDefault,
          userAgentPackageName: 'com.example.mobile',
          tileUpdateTransformer: TileUpdateTransformers.debounce(
            const Duration(milliseconds: 150),
          ),
        ),
        if (position != null)
        // 🚀 CHỈNH SỬA CHÍNH: Loại bỏ hẳn MobileLayerTransformer nếu nó xung đột ma trận tọa độ,
        // vì bản thân 1 Marker đơn lẻ chạy không cần transformer vẫn mượt 60 FPS.
          MarkerLayer(
            markers: [
              Marker(
                point: LatLng(position!.latitude, position!.longitude),
                width: 60,
                height: 60,
                // 🚀 QUAN TRỌNG: Khóa tâm Marker vào giữa tọa độ, tránh bị trượt khi zoom
                alignment: Alignment.center,
                child: const UserMarkerWidget(),
              ),
            ],
          ),
      ],
    );
  }
}
