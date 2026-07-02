import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';

import 'package:mobile/core/constants/app_constants.dart';
import '../../../../core/di/di.dart';
import '../../../../core/session/session_controller.dart';

import '../widgets/layer_widget.dart';
import '../widgets/search_widget.dart';
import '../widgets/sos_button_widget.dart';
import '../widgets/util_widget.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  final MapController _mapController = MapController();

  bool _centered = false;

  @override
  void initState() {
    super.initState();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    final session = getIt<SessionController>();
    final pos = session.state.position;

    if (!_centered && pos != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _mapController.move(
          LatLng(pos.latitude, pos.longitude),
          15,
        );
      });

      _centered = true;
    }
  }

  @override
  void dispose() {
    _mapController.dispose();
    super.dispose();
  }

  void _moveCameraIfNeeded(dynamic pos) {
    if (_centered || pos == null) return;

    _mapController.move(
      LatLng(pos.latitude, pos.longitude),
      15,
    );

    _centered = true;
  }

  @override
  Widget build(BuildContext context) {
    final sessionController = getIt<SessionController>();

    final position = sessionController.state.position;

    print("Location trong ui: ${position}");

    // auto center khi position update (reactive chuẩn)
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _moveCameraIfNeeded(position);
    });

    return Scaffold(
      body: Stack(
        children: [
          FlutterMap(
            mapController: _mapController,
            options: const MapOptions(
              initialCenter: LatLng(10.0354, 105.7828),
              initialZoom: 13,
            ),
            children: [
              TileLayer(
                urlTemplate: AppConstants.urlTemplate,
                userAgentPackageName: 'com.example.mobile',
              ),

              if (position != null)
                MarkerLayer(
                  markers: [
                    Marker(
                      point: LatLng(
                        position.latitude,
                        position.longitude,
                      ),
                      width: 60,
                      height: 60,
                      child: _buildMarker(),
                    ),
                  ],
                ),
            ],
          ),

          // ================= TOP UI =================
          const Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              child: Padding(
                padding: EdgeInsets.fromLTRB(16, 12, 16, 0),
                child: Column(
                  children: [
                    SearchWidget(),
                    SizedBox(height: 12),
                    Align(
                      alignment: Alignment.centerRight,
                      child: LayerWidget(),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // ================= BOTTOM UI =================
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: SafeArea(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                child: SizedBox(
                  height: 160,
                  child: Stack(
                    children: const [
                      Align(
                        alignment: Alignment.bottomCenter,
                        child: SosButtonWidget(),
                      ),
                      Align(
                        alignment: Alignment.bottomRight,
                        child: UtilWidget(),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMarker() {
    return Stack(
      alignment: Alignment.center,
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: Colors.blue.withOpacity(0.3),
            shape: BoxShape.circle,
          ),
        ),
        Container(
          width: 18,
          height: 18,
          decoration: BoxDecoration(
            color: Colors.blue,
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white, width: 2.5),
          ),
        ),
      ],
    );
  }
}