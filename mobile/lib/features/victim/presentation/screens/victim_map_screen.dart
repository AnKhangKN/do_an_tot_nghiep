import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import 'package:mobile/shared/widgtes/phone_call_widget.dart';

import '../../../../core/di/di.dart';
import '../../../../core/location/data/location_service.dart';
import '../../../../core/location/data/location_repository.dart';
import '../../../../core/network/direction_service.dart';
import '../../../../core/session/session_controller.dart';

import '../../../../shared/widgtes/map_widget.dart';
import '../../../../shared/widgtes/layer_widget.dart';
import '../../../../shared/widgtes/search_widget.dart';
import '../widgets/victim_sos_button_widget.dart';
import '../widgets/victim_util_widget.dart';
import '../widgets/victim_rescue_info_widget.dart';
import '../widgets/emergency_qr_dialog_widget.dart';
import 'package:geolocator/geolocator.dart';
import '../providers/victim_map_provider.dart';
import '../../../../shared/widgtes/emergency_dialog_widget.dart';
import '../../../../shared/widgtes/rating_dialog_widget.dart';
import '../../../dangerous_points/presentation/providers/geofence_provider.dart';
import '../../../../shared/widgtes/geofence_alert_dialog.dart';

class VictimMapScreen extends StatefulWidget {
  const VictimMapScreen({super.key});

  @override
  State<VictimMapScreen> createState() => _VictimMapScreenState();
}

class _VictimMapScreenState extends State<VictimMapScreen> with TickerProviderStateMixin {
  final MapController _mapController = MapController();
  StreamSubscription<Position>? _realtimeLocationSubscription;

  // Lưu giá trị isSearchingRescuer trước đó để phát hiện thay đổi từ true -> false
  bool _prevSearching = false;

  List<LatLng> _routePoints = [];
  LatLng? _lastStart;
  LatLng? _lastEnd;
  double? _distanceKm;   // Khoảng cách của cứu hộ viên tới đây (km)
  int? _durationSec;     // ETA ước tính (đơn vị giây)

  void _animatedMapMove(LatLng destLocation, double destZoom) {
    final camera = _mapController.camera;
    final latTween = Tween<double>(begin: camera.center.latitude, end: destLocation.latitude);
    final lngTween = Tween<double>(begin: camera.center.longitude, end: destLocation.longitude);
    final zoomTween = Tween<double>(begin: camera.zoom, end: destZoom);

    final controller = AnimationController(
      duration: const Duration(milliseconds: 750),
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

  Future<void> _startRealtimeLocationTracking() async {
    try {
      final locationRepository = getIt<LocationRepository>();
      final positionStream = await locationRepository.startTracking(distanceFilter: 5);
      if (positionStream != null && mounted) {
        await _realtimeLocationSubscription?.cancel();
        _realtimeLocationSubscription = positionStream.listen((position) {
          if (!mounted) return;
          getIt<SessionController>().updatePosition(position);
          getIt<GeofenceProvider>().checkGeofence(position.latitude, position.longitude);
        });
      }
    } catch (e) {
      debugPrint("⚠️ [VictimMap] Lỗi bắt đầu theo dõi vị trí realtime: $e");
    }
  }

  Future<void> _moveToCurrentLocation() async {
    final sessionController = getIt<SessionController>();
    
    // 1. Phản hồi tức thì 0ms: Chuyển bản đồ đến vị trí hiện có trong máy ngay lần bấm đầu tiên
    var initialPos = sessionController.state.position;
    initialPos ??= await LocationService().getCurrentPosition();

    if (initialPos != null && mounted) {
      sessionController.updatePosition(initialPos);
      final destLatLng = LatLng(initialPos.latitude, initialPos.longitude);
      final currentZoom = _mapController.camera.zoom;
      final destZoom = currentZoom < 15.5 ? 16.5 : currentZoom;
      _animatedMapMove(destLatLng, destZoom);
    }

    // 2. Chạy ngầm đọc GPS tươi mới nhất từ phần cứng và tự động cập nhật lại nếu tọa độ thay đổi
    try {
      final freshPosition = await LocationService().getFreshPosition();
      if (freshPosition != null && mounted) {
        sessionController.updatePosition(freshPosition);
        final freshLatLng = LatLng(freshPosition.latitude, freshPosition.longitude);
        final currentZoom = _mapController.camera.zoom;
        final destZoom = currentZoom < 15.5 ? 16.5 : currentZoom;
        _animatedMapMove(freshLatLng, destZoom);
      }
    } catch (e) {
      debugPrint("⚠️ [VictimMap] Lỗi lấy GPS tươi: $e");
    }
  }

  bool _showingGeofenceDialog = false;

  @override
  void initState() {
    super.initState();
    getIt<SessionController>().addListener(_onSessionChanged);
    getIt<GeofenceProvider>().addListener(_onGeofenceChanged);
    _startRealtimeLocationTracking();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      if (!mounted) return;
      _onSessionChanged();
      context.read<VictimMapProvider>().loadIncidentTypes();

      // Lấy vị trí khởi tạo ban đầu lập tức
      final sessionController = getIt<SessionController>();
      var pos = sessionController.state.position;
      pos ??= await LocationService().getCurrentPosition();

      if (pos != null) {
        sessionController.updatePosition(pos);
      }

      // Tải điểm nguy hiểm và tự động trigger kiểm tra geofence ngay tức thì
      await getIt<GeofenceProvider>().loadApprovedPoints(
        userLat: pos?.latitude,
        userLng: pos?.longitude,
      );
    });
  }

  @override
  void dispose() {
    _realtimeLocationSubscription?.cancel();
    getIt<SessionController>().removeListener(_onSessionChanged);
    getIt<GeofenceProvider>().removeListener(_onGeofenceChanged);
    _mapController.dispose();
    super.dispose();
  }

  void _onGeofenceChanged() {
    if (!mounted) return;
    final geofenceProvider = getIt<GeofenceProvider>();
    final activeAlert = geofenceProvider.activeAlertPoint;
    final distance = geofenceProvider.activeAlertDistanceMeters;

    if (activeAlert != null && distance != null && !_showingGeofenceDialog) {
      _showingGeofenceDialog = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        GeofenceAlertDialog.show(
          context,
          point: activeAlert,
          distanceMeters: distance,
          onDismiss: () {
            _showingGeofenceDialog = false;
            geofenceProvider.dismissAlert();
          },
        );
      });
    }
  }

  void _onSessionChanged() {
    if (!mounted) return;
    final sessionController = getIt<SessionController>();
    final position = sessionController.state.position;
    final isBeingRescued = sessionController.isBeingRescued;
    final rescuerPos = sessionController.rescuerPosition;

    if (position != null) {
      getIt<GeofenceProvider>().checkGeofence(position.latitude, position.longitude);
    }

    if (isBeingRescued && rescuerPos != null && position != null) {
      // Tính route theo hướng cứu hộ viên đi tới nạn nhân (giống bên Rescuer screen)
      // để cả 2 phía hiển thị cùng một khoảng cách OSRM
      _updateRoute(
        rescuerPos,                                        // START = cứu hộ viên
        LatLng(position.latitude, position.longitude),     // END   = nạn nhân
      );
    } else if (!isBeingRescued && _routePoints.isNotEmpty) {
      setState(() {
        _routePoints = [];
        _lastStart = null;
        _lastEnd = null;
        _distanceKm = null;
        _durationSec = null;
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

    // Debounce: bỏ qua nếu điểm xuất phát (cứu hộ viên) chưa di chuyển quá 15m và chưa quá 4 giây
    if (_routePoints.isNotEmpty && _lastStart != null && _lastRouteFetchTime != null) {
      final distanceInMeters = const Distance().as(
        LengthUnit.Meter,
        _lastStart!,   // điểm di chuyển = rescuerPos (start)
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
      final info = await DirectionService().getRouteInfo(start, end);
      if (mounted && info != null && info.points.isNotEmpty) {
        setState(() {
          _routePoints = info.points;
          _distanceKm = info.distanceKm;
          _durationSec = info.durationSec;
        });
      }
    } catch (e) {
      debugPrint("⚠️ [VictimMap] Lỗi lấy tuyến đường: $e");
    }
  }

  List<Marker> _buildDangerousPointMarkers(Position? currentPos) {
    final geofenceProvider = getIt<GeofenceProvider>();
    // Chỉ lấy các điểm trong bán kính 5km xung quanh Nạn nhân để tránh nặng bản đồ
    final points = geofenceProvider.getNearbyPoints(
      currentPos?.latitude,
      currentPos?.longitude,
      maxRadiusMeters: 5000.0,
    );

    return points.map((pt) {
      final String level = pt.dangerLevel.toUpperCase();

      Color bgColor;
      Color shadowColor;
      IconData iconData;

      if (level == 'HIGH') {
        bgColor = const Color(0xFFDC2626); // Đỏ nổi bật
        shadowColor = const Color(0x66DC2626);
        iconData = Icons.dangerous_rounded;
      } else if (level == 'MEDIUM') {
        bgColor = const Color(0xFFF97316); // Cam
        shadowColor = const Color(0x66F97316);
        iconData = Icons.warning_amber_rounded;
      } else {
        bgColor = const Color(0xFF10B981); // Xanh lá dịu
        shadowColor = const Color(0x6610B981);
        iconData = Icons.info_outline_rounded;
      }

      return Marker(
        point: LatLng(pt.latitude, pt.longitude),
        width: 36,
        height: 36,
        child: GestureDetector(
          onTap: () {
            final dist = currentPos != null
                ? Geolocator.distanceBetween(
                    currentPos.latitude,
                    currentPos.longitude,
                    pt.latitude,
                    pt.longitude,
                  )
                : 0.0;
            GeofenceAlertDialog.show(
              context,
              point: pt,
              distanceMeters: dist,
              onDismiss: () {},
            );
          },
          child: Container(
            decoration: BoxDecoration(
              color: bgColor,
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 2),
              boxShadow: [
                BoxShadow(color: shadowColor, blurRadius: 6, spreadRadius: 1, offset: const Offset(0, 2)),
              ],
            ),
            child: Icon(iconData, color: Colors.white, size: 20),
          ),
        ),
      );
    }).toList();
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
            listenable: Listenable.merge([sessionController, getIt<GeofenceProvider>()]),
            builder: (context, _) {
              final currentPosition = sessionController.state.position;
              final currentRescuerPos = sessionController.rescuerPosition;

              return MapWidget(
                mapController: _mapController,
                position: currentPosition,
                partnerPosition: isBeingRescued ? currentRescuerPos : null,
                partnerMarkerChild: const Icon(Icons.airport_shuttle, color: Colors.green, size: 40),
                additionalMarkers: _buildDangerousPointMarkers(currentPosition),
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
                  height: 240,
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
                              final activeSosId = context.read<VictimMapProvider>().activeSosRequestId;
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: const Text('Chưa tìm thấy cứu hộ online. Tạo mã QR cho cứu hộ xung quanh quét?'),
                                  backgroundColor: Colors.amber.shade900,
                                  duration: const Duration(seconds: 8),
                                  action: activeSosId != null
                                      ? SnackBarAction(
                                          label: 'MÃ QR',
                                          textColor: Colors.amberAccent,
                                          onPressed: () {
                                            EmergencyQRDialogWidget.show(
                                              context,
                                              sosRequestId: activeSosId,
                                            );
                                          },
                                        )
                                      : null,
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
                                    distanceKm: _distanceKm,
                                    durationSec: _durationSec,
                                  )
                                : VictimSosButtonWidget(
                                    victimLat: sessionController.state.position?.latitude,
                                    victimLng: sessionController.state.position?.longitude,
                                  ),
                          );
                        },
                      ),
                      ListenableBuilder(
                        listenable: sessionController,
                        builder: (context, _) {
                          final isSearching = sessionController.isSearchingRescuer;
                          final isBeingRescued = sessionController.isBeingRescued;

                          if (isBeingRescued) {
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

              final sosId = sessionController.completedSosRequestId;
              final rName = sessionController.completedRescuerName;

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
                      const SizedBox(width: 10),
                      const Expanded(
                        child: Text(
                          "Đã cứu hộ thành công!",
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Colors.green,
                            fontSize: 14,
                          ),
                        ),
                      ),
                      if (sosId != null)
                        ElevatedButton.icon(
                          onPressed: () {
                            sessionController.dismissSuccessAlert();
                            RatingDialogWidget.show(
                              context,
                              sosRequestId: sosId,
                              rescuerName: rName,
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.amber.shade700,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            minimumSize: Size.zero,
                            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          icon: const Icon(Icons.star, size: 16),
                          label: const Text('Đánh giá', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        ),
                      const SizedBox(width: 4),
                      IconButton(
                        icon: const Icon(Icons.close, color: Colors.green, size: 20),
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
