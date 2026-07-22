import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:mobile/shared/widgtes/map_widget.dart';
import 'package:provider/provider.dart';
import '../../../../core/di/di.dart';
import '../../../../core/location/data/location_service.dart';
import '../../../../core/network/direction_service.dart';
import '../../../../core/session/session_controller.dart';
import '../../../../core/socket/modules/rescuer_socket.dart';
import '../providers/rescuer_map_provider.dart';
import '../../../../shared/widgtes/layer_widget.dart';
import '../providers/sos_provider.dart';
import '../widgets/rescuer_go_online_button_widget.dart';
import '../widgets/rescuer_util_widget.dart';
import '../widgets/rescuer_rescue_info_widget.dart';
import '../../../../shared/widgtes/search_widget.dart';
import '../../../../shared/widgtes/emergency_dialog_widget.dart';
import '../widgets/sos_offer_overlay_widget.dart';
import '../../models/sos_offer_model.dart';

class RescuerMapScreen extends StatefulWidget {
  const RescuerMapScreen({super.key});

  @override
  State<RescuerMapScreen> createState() => _RescuerMapScreenState();
}

class _RescuerMapScreenState extends State<RescuerMapScreen> with TickerProviderStateMixin {
  final MapController _mapController = MapController();

  @override
  void initState() {
    super.initState();
    getIt<SessionController>().addListener(_onSessionOrProviderChanged);
    getIt<SOSProvider>().addListener(_onSessionOrProviderChanged);
    WidgetsBinding.instance.addPostFrameCallback((_) => _onSessionOrProviderChanged());
  }

  @override
  void dispose() {
    getIt<SessionController>().removeListener(_onSessionOrProviderChanged);
    getIt<SOSProvider>().removeListener(_onSessionOrProviderChanged);
    _mapController.dispose();
    super.dispose();
  }

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
    final session = getIt<SessionController>();
    var position = session.state.position;

    if (position == null) {
      position = await LocationService().getCurrentPosition();
      if (position != null) {
        session.updatePosition(position);
      }
    }

    if (position != null && mounted) {
      final destLatLng = LatLng(position.latitude, position.longitude);
      final currentZoom = _mapController.camera.zoom;
      final destZoom = currentZoom < 15.0 ? 16.0 : currentZoom;
      _animatedMapMove(destLatLng, destZoom);
    }
  }

  void _onSessionOrProviderChanged() {
    if (!mounted) return;
    final session = getIt<SessionController>();
    final position = session.state.position;
    
    final sosProvider = getIt<SOSProvider>();
    final isRescuing = sosProvider.isRescuing;
    final activeRescue = sosProvider.activeRescue;

    final cancelledNotice = sosProvider.cancelledNotice;
    if (cancelledNotice != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(cancelledNotice),
            backgroundColor: Colors.orange.shade800,
            duration: const Duration(seconds: 4),
          ),
        );
        sosProvider.clearCancelledNotice();
      });
    }

    if (isRescuing && activeRescue != null && position != null) {
      _updateRoute(
        LatLng(position.latitude, position.longitude),
        LatLng(activeRescue.victimLat, activeRescue.victimLng),
      );
    } else if (!isRescuing && _routePoints.isNotEmpty) {
      setState(() {
        _routePoints = [];
        _lastStart = null;
        _lastEnd = null;
      });
    }
  }

  void _handleAcceptUI(SOSOfferModel sos, SOSProvider sosProvider) {
    debugPrint("🚀 [RESCUER] Bấm NHẬN CUỐC ID: ${sos.sosId}");
    getIt<RescuerSocket>().acceptRescue(sos.sosId);
    sosProvider.clearSOS(); // Tắt bảng thông báo
  }

  // Xử lý tạm thời khi bấm TỪ CHỐI / HẾT GIỜ (Chỉ tắt Pop-up để test UI)
  void _handleRejectUI(SOSOfferModel sos, SOSProvider sosProvider) {
    debugPrint("❌ [TEST UI] Đã BỎ QUA cuốc ID: ${sos.sosId}");
    sosProvider.clearSOS(); // Tắt bảng thông báo
  }

  List<LatLng> _routePoints = [];
  LatLng? _lastStart;
  LatLng? _lastEnd;

  DateTime? _lastRouteFetchTime;

  Future<void> _updateRoute(LatLng start, LatLng end) async {
    if (_lastStart?.latitude == start.latitude &&
        _lastStart?.longitude == start.longitude &&
        _lastEnd?.latitude == end.latitude &&
        _lastEnd?.longitude == end.longitude) {
      return;
    }

    if (_routePoints.isNotEmpty && _lastStart != null && _lastRouteFetchTime != null) {
      final distanceInMeters = const Distance().as(
        LengthUnit.Meter,
        _lastStart!,
        start,
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
      debugPrint("⚠️ [RescuerMap] Lỗi lấy tuyến đường: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    // Lắng nghe position từ session
    final session = context.watch<SessionController>();
    final position = session.state.position;

    final sosProvider = context.watch<SOSProvider>();
    final currentSOS = sosProvider.currentSOS;
    final isRescuing = sosProvider.isRescuing;
    final activeRescue = sosProvider.activeRescue;

    if (currentSOS != null) {
      debugPrint("Bên screen đã nhận! ${currentSOS.toString()}");
    }

    // Lấy isOnline
    final isOnline = session.isOnline;
    final isProcessing = session.isProcessing;

    return Scaffold(
      body: Stack(
        children: [
          MapWidget(
            mapController: _mapController,
            position: position,
            partnerPosition: isRescuing && activeRescue != null
                ? LatLng(activeRescue.victimLat, activeRescue.victimLng)
                : null,
            partnerMarkerChild: const Icon(Icons.location_on, color: Colors.red, size: 40),
            polylines: isRescuing && _routePoints.isNotEmpty
                ? [
                    Polyline(
                      points: _routePoints,
                      strokeWidth: 5.0,
                      color: Colors.blue,
                    )
                  ]
                : null,
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
                child: isRescuing && activeRescue != null
                    ? RescuerRescueInfoWidget(
                        activeVictim: sosProvider.activeVictim,
                        sosRequestId: activeRescue.sosId,
                        description: activeRescue.description,
                        incidentTypeName: activeRescue.incidentTypeName,
                        onComplete: () {
                          getIt<RescuerSocket>().completeRescue(activeRescue.sosId);
                          sosProvider.endRescue();
                        },
                      )
                    : SizedBox(
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
                                  child: RescuerGoOnlineButtonWidget(
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
                            Align(
                              alignment: Alignment.bottomRight,
                              child: RescuerUtilWidget(
                                onLocationTap: _moveToCurrentLocation,
                                onEmergencyTap: () => EmergencyDialogWidget.show(context),
                              ),
                            ),
                          ],
                        ),
                      ),
              ),
            ),
          ),

          if (sosProvider.showSuccessRescueAlert)
            Positioned(
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
                    const Icon(Icons.stars, color: Colors.green, size: 28),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Text(
                        "Cứu hộ thành công! Tuyệt vời.",
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Colors.green,
                          fontSize: 15,
                        ),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: Colors.green),
                      onPressed: () => sosProvider.dismissSuccessAlert(),
                    )
                  ],
                ),
              ),
            ),

          // ================= SOS OVERLAY (HIỆN LÊN ĐỂ TEST GIAO DIỆN) =================
          if (currentSOS != null) ...[
            // Lớp nền đen mờ che phủ bản đồ
            Positioned.fill(
              child: Container(
                color: Colors.black.withValues(alpha: 0.5),
              ),
            ),
            // Widget thông báo khẩn cấp (có đếm ngược 30s)
            Positioned(
              left: 16,
              right: 16,
              bottom: 30,
              child: SOSOfferOverlayWidget(
                sos: currentSOS,
                currentPosition: position,
                timeoutSeconds: 30,
                onAccept: () => _handleAcceptUI(currentSOS, sosProvider),
                onReject: () => _handleRejectUI(currentSOS, sosProvider),
              ),
            ),
          ],
        ],
      ),
    );
  }
}