import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import 'package:mobile/shared/widgtes/phone_call_widget.dart';

import '../../../../core/di/di.dart';
import '../../../../core/location/data/location_service.dart';
import '../../../../core/network/direction_service.dart';
import '../../../../core/session/session_controller.dart';

import '../../../../shared/widgtes/map_widget.dart';
import '../../../../shared/widgtes/layer_widget.dart';
import '../../../../shared/widgtes/search_widget.dart';
import '../widgets/victim_sos_button_widget.dart';
import '../widgets/victim_util_widget.dart';
import '../widgets/victim_rescue_info_widget.dart';
import '../providers/victim_map_provider.dart';
import '../../../../shared/widgtes/emergency_dialog_widget.dart';

class VictimMapScreen extends StatefulWidget {
  const VictimMapScreen({super.key});

  @override
  State<VictimMapScreen> createState() => _VictimMapScreenState();
}

class _VictimMapScreenState extends State<VictimMapScreen> with TickerProviderStateMixin {
  final MapController _mapController = MapController();

  // Lưu giá trị isSearchingRescuer trước đó để phát hiện thay đổi từ true -> false
  bool _prevSearching = false;

  List<LatLng> _routePoints = [];
  LatLng? _lastStart;
  LatLng? _lastEnd;

  void _animatedMapMove(LatLng destLocation, double destZoom) {
    final camera = _mapController.camera;
    final latTween = Tween<double>(begin: camera.center.latitude, end: destLocation.latitude);
    final lngTween = Tween<double>(begin: camera.center.longitude, end: destLocation.longitude);
    final zoomTween = Tween<double>(begin: camera.zoom, end: destZoom);

    final controller = AnimationController(
      duration: const Duration(milliseconds: 500),
      vsync: this,
    );

    final Animation<double> animation = CurvedAnimation(
      parent: controller,
      curve: Curves.fastOutSlowIn,
    );

    controller.addListener(() {
      if (!mounted) return;
      _mapController.move(
        LatLng(latTween.evaluate(animation), lngTween.evaluate(animation)),
        zoomTween.evaluate(animation),
      );
    });

    animation.addStatusListener((status) {
      if (status == AnimationStatus.completed || status == AnimationStatus.dismissed) {
        controller.dispose();
      }
    });

    controller.forward();
  }

  Future<void> _moveToCurrentLocation() async {
    final sessionController = getIt<SessionController>();
    var position = sessionController.state.position;

    if (position == null) {
      position = await LocationService().getCurrentPosition();
      if (position != null) {
        sessionController.updatePosition(position);
      }
    }

    if (position != null && mounted) {
      final destLatLng = LatLng(position.latitude, position.longitude);
      final currentZoom = _mapController.camera.zoom;
      final destZoom = currentZoom < 15.0 ? 16.0 : currentZoom;
      _animatedMapMove(destLatLng, destZoom);
    }
  }

  @override
  void initState() {
    super.initState();
    getIt<SessionController>().addListener(_onSessionChanged);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      _onSessionChanged();
      context.read<VictimMapProvider>().loadIncidentTypes();
    });
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

  DateTime? _lastRouteFetchTime;

  Future<void> _updateRoute(LatLng start, LatLng end) async {
    if (_lastStart?.latitude == start.latitude &&
        _lastStart?.longitude == start.longitude &&
        _lastEnd?.latitude == end.latitude &&
        _lastEnd?.longitude == end.longitude) {
      return;
    }

    // Tối ưu: Nếu đã có đường đi và Rescuer di chuyển < 15m HOẶC vừa fetch chỉ đường trong vòng 4 giây -> Bỏ qua HTTP request
    if (_routePoints.isNotEmpty && _lastEnd != null && _lastRouteFetchTime != null) {
      final distanceInMeters = const Distance().as(
        LengthUnit.Meter,
        _lastEnd!,
        end,
      );
      final secondsSinceLastFetch = DateTime.now().difference(_lastRouteFetchTime!).inSeconds;
      if (distanceInMeters < 15 && secondsSinceLastFetch < 4) {
        return;
      }
    }

    _lastStart = start;
    _lastEnd = end;
    _lastRouteFetchTime = DateTime.now();

    try {
      final route = await DirectionService().getRoute(start, end);
      if (mounted && route.isNotEmpty) {
        setState(() {
          _routePoints = route;
        });
      }
    } catch (e) {
      debugPrint("⚠️ [VictimMap] Lỗi lấy tuyến đường: $e");
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
                  height: 180,
                  child: Stack(
                    children: [
                      // Lắng nghe SessionController để hiển thị SnackBar khi không tìm được rescuer
                      ListenableBuilder(
                        listenable: sessionController,
                        builder: (context, _) {
                          final isSearching = sessionController.isSearchingRescuer;
                          final currentIsBeingRescued = sessionController.isBeingRescued;

                          // Phát hiện chuyển từ true → false: không tìm được rescuer
                          if (_prevSearching && !isSearching && !currentIsBeingRescued) {
                            WidgetsBinding.instance.addPostFrameCallback((_) {
                              if (!mounted) return;
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Chưa tìm thấy người cứu hộ phù hợp. Vui lòng thử lại sau!'),
                                  backgroundColor: Colors.orange,
                                  duration: Duration(seconds: 4),
                                ),
                              );
                            });
                          }
                          _prevSearching = isSearching;

                          return Align(
                            alignment: Alignment.bottomCenter,
                            child: currentIsBeingRescued
                                ? VictimRescueInfoWidget(
                                    activeRescuer: sessionController.activeRescuer,
                                  )
                                : VictimSosButtonWidget(
                                    victimLat: position?.latitude,
                                    victimLng: position?.longitude,
                                  ),
                          );
                        },
                      ),
                      ListenableBuilder(
                        listenable: sessionController,
                        builder: (context, _) {
                          final isSearching = sessionController.isSearchingRescuer;
                          final isBeingRescued = sessionController.isBeingRescued;

                          if (isSearching || isBeingRescued) {
                            return const SizedBox.shrink();
                          }

                          return Align(
                            alignment: Alignment.bottomRight,
                            child: VictimUtilWidget(
                              onLocationTap: _moveToCurrentLocation,
                              onCallTap: () => EmergencyDialogWidget.show(context),
                            ),
                          );
                        },
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
