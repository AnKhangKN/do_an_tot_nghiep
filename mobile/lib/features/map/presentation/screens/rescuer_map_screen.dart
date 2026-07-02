import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';
import 'package:mobile/shared/widgtes/MapWidget.dart';
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

  @override
  void dispose() {
    _mapController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Lắng nghe position từ session
    final session = context.watch<SessionController>();
    final position = session.state.position;

    // Lấy isOnline
    final isOnline = session.isOnline;
    final isProcessing = session.isProcessing;
    debugPrint("Trạng thái hiện tại của nút là: $isOnline");

    return Scaffold(
      body: Stack(
        children: [
          MapWidget(mapController: _mapController, position: position),

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
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Consumer<RescuerMapProvider>(
                        builder: (context, provider, _) {
                          return Align(
                            alignment: isOnline
                                ? Alignment.bottomLeft
                                : Alignment.bottomCenter,
                            child: GoOnlineButtonWidget(
                              isOnline: isOnline,
                              isProcessing: isProcessing,
                              onTap: () async {
                                if (isOnline) {
                                  await provider.goOffline();
                                } else {
                                  await provider.goOnline();
                                }
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
}
