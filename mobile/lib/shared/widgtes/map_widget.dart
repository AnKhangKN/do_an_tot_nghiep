import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';
import 'package:mobile/shared/widgtes/user_marker_widget.dart';

import '../../core/constants/app_constants.dart';

class MapWidget extends StatelessWidget {
  final MapController mapController;
  final Position? position;
  final List<Marker>? additionalMarkers;
  final List<Polyline>? polylines;

  const MapWidget({
    super.key,
    required this.mapController,
    required this.position,
    this.additionalMarkers,
    this.polylines,
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
        if (polylines != null && polylines!.isNotEmpty)
          PolylineLayer(polylines: polylines!),
        MarkerLayer(
          markers: [
            if (position != null)
              Marker(
                point: LatLng(position!.latitude, position!.longitude),
                width: 60,
                height: 60,
                alignment: Alignment.center,
                child: const UserMarkerWidget(),
              ),
            if (additionalMarkers != null) ...additionalMarkers!,
          ],
        ),
      ],
    );
  }
}
