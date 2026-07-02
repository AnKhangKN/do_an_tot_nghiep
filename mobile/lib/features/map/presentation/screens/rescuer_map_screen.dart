import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/di/di.dart';
import '../../../../core/session/session_controller.dart';

import '../providers/rescuer_map_provider.dart';
import '../widgets/go_online_button_widget.dart';
import '../widgets/layer_widget.dart';
import '../widgets/rescuer_util_widget.dart';
import '../widgets/search_widget.dart';

class RescuerMapScreen extends StatefulWidget {
  const RescuerMapScreen({super.key});

  @override
  State<RescuerMapScreen> createState() => _RescuerMapScreenState();
}

class _RescuerMapScreenState extends State<RescuerMapScreen> {
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

  void _moveCameraIfNeeded(Position? pos) {
    if (_centered || pos == null) return;

    _mapController.move(
      LatLng(pos.latitude, pos.longitude),
      15,
    );

    _centered = true;
  }

  @override
  Widget build(BuildContext context) {
    final session = getIt<SessionController>();
    final position = session.state.position;

    // reactive center khi position update
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
                  height: 180,
                  child: Stack(
                    children: [
                      Consumer<RescuerMapProvider>(
                        builder: (context, provider, _) {
                          return Align(
                            alignment: provider.isOnline
                                ? Alignment.bottomLeft
                                : Alignment.bottomCenter,
                            child: GoOnlineButtonWidget(
                              isOnline: provider.isOnline,
                              onTap: () async {
                                provider.isOnline
                                    ? await provider.goOffline()
                                    : await provider.goOnline();
                              },
                            ),
                          );
                        },
                      ),

                      const Align(
                        alignment: Alignment.bottomRight,
                        child: RescuerUtilWidget(),
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