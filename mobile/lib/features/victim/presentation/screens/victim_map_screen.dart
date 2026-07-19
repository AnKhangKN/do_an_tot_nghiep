import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

import '../../../../core/di/di.dart';
import '../../../../core/network/direction_service.dart';
import '../../../../core/session/session_controller.dart';

import '../../../../shared/widgtes/map_widget.dart';
import '../../../../shared/widgtes/layer_widget.dart';
import '../../../../shared/widgtes/search_widget.dart';
import '../widgets/victim_sos_button_widget.dart';
import '../widgets/victim_util_widget.dart';

class VictimMapScreen extends StatefulWidget {
  const VictimMapScreen({super.key});

  @override
  State<VictimMapScreen> createState() => _VictimMapScreenState();
}

class _VictimMapScreenState extends State<VictimMapScreen> {
  final MapController _mapController = MapController();

  // Lưu giá trị isSearchingRescuer trước đó để phát hiện thay đổi từ true -> false
  bool _prevSearching = false;

  List<LatLng> _routePoints = [];
  LatLng? _lastStart;
  LatLng? _lastEnd;

  @override
  void initState() {
    super.initState();
    getIt<SessionController>().addListener(_onSessionChanged);
    WidgetsBinding.instance.addPostFrameCallback((_) => _onSessionChanged());
  }

  @override
  void dispose() {
    getIt<SessionController>().removeListener(_onSessionChanged);
    _mapController.dispose();
    super.dispose();
  }

  void _onSessionChanged() {
    if (!mounted) return;
    final sessionController = getIt<SessionController>();
    final position = sessionController.state.position;
    final isBeingRescued = sessionController.isBeingRescued;
    final rescuerPos = sessionController.rescuerPosition;

    if (isBeingRescued && rescuerPos != null && position != null) {
      _updateRoute(
        LatLng(position.latitude, position.longitude),
        rescuerPos,
      );
    } else if (!isBeingRescued && _routePoints.isNotEmpty) {
      setState(() {
        _routePoints = [];
        _lastStart = null;
        _lastEnd = null;
      });
    }
  }

  Future<void> _updateRoute(LatLng start, LatLng end) async {
    if (_lastStart?.latitude == start.latitude &&
        _lastStart?.longitude == start.longitude &&
        _lastEnd?.latitude == end.latitude &&
        _lastEnd?.longitude == end.longitude) {
      return;
    }
    _lastStart = start;
    _lastEnd = end;

    final route = await DirectionService().getRoute(start, end);
    if (mounted) {
      setState(() {
        _routePoints = route;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final sessionController = getIt<SessionController>();
    final position = sessionController.state.position;
    final isBeingRescued = sessionController.isBeingRescued;

    return Scaffold(
      body: Stack(
        children: [
          ListenableBuilder(
            listenable: sessionController,
            builder: (context, _) {
              final currentRescuerPos = sessionController.rescuerPosition;

              return MapWidget(
                mapController: _mapController,
                position: position,
                partnerPosition: isBeingRescued ? currentRescuerPos : null,
                partnerMarkerChild: const Icon(Icons.airport_shuttle, color: Colors.green, size: 40),
                polylines: isBeingRescued && _routePoints.isNotEmpty
                    ? [
                        Polyline(
                          points: _routePoints,
                          strokeWidth: 5.0,
                          color: Colors.blue,
                        )
                      ]
                    : null,
              );
            },
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
                    children: [
                      // Lắng nghe SessionController để hiển thị SnackBar khi không tìm được rescuer
                      ListenableBuilder(
                        listenable: sessionController,
                        builder: (context, _) {
                          final isSearching = sessionController.isSearchingRescuer;

                          // Phát hiện chuyển từ true → false: không tìm được rescuer
                          if (_prevSearching && !isSearching && !isBeingRescued) {
                            WidgetsBinding.instance.addPostFrameCallback((_) {
                              if (!mounted) return;
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Không tìm thấy người cứu hộ ở gần đây'),
                                  backgroundColor: Colors.orange,
                                  duration: Duration(seconds: 4),
                                ),
                              );
                            });
                          }
                          _prevSearching = isSearching;

                          return Align(
                            alignment: Alignment.bottomCenter,
                            child: isBeingRescued
                                ? Container(
                                    width: double.infinity,
                                    padding: const EdgeInsets.all(16),
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(20),
                                      boxShadow: const [
                                        BoxShadow(color: Colors.black12, blurRadius: 10)
                                      ],
                                    ),
                                    child: Column(
                                      mainAxisSize: MainAxisSize.min,
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        const Row(
                                          children: [
                                            Icon(Icons.check_circle, color: Colors.green),
                                            SizedBox(width: 8),
                                            Text(
                                              "Người cứu hộ đang đến!",
                                              style: TextStyle(
                                                fontWeight: FontWeight.bold,
                                                fontSize: 16,
                                                color: Colors.green,
                                              ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 8),
                                        Text(
                                          "Họ tên: ${sessionController.activeRescuer?['fullName'] ?? 'Không rõ'}",
                                          style: const TextStyle(fontWeight: FontWeight.w600),
                                        ),
                                        Text(
                                          "SĐT: ${sessionController.activeRescuer?['phone'] ?? 'Không rõ'}",
                                        ),
                                      ],
                                    ),
                                  )
                                : VictimSosButtonWidget(
                                    victimLat: position?.latitude,
                                    victimLng: position?.longitude,
                                  ),
                          );
                        },
                      ),
                      const Align(
                        alignment: Alignment.bottomRight,
                        child: VictimUtilWidget(),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
          ListenableBuilder(
            listenable: sessionController,
            builder: (context, _) {
              if (!sessionController.showSuccessRescueAlert) return const SizedBox.shrink();

              return Positioned(
                left: 16,
                right: 16,
                bottom: 16,
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.green.shade50,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.green.shade300, width: 1.5),
                    boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 10)],
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.check_circle, color: Colors.green, size: 28),
                      const SizedBox(width: 12),
                      const Expanded(
                        child: Text(
                          "Đã cứu hộ thành công! Cảm ơn bạn.",
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Colors.green,
                            fontSize: 15,
                          ),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: Colors.green),
                        onPressed: () => sessionController.dismissSuccessAlert(),
                      )
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
