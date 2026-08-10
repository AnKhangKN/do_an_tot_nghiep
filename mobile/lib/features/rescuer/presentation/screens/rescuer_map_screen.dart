import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:mobile/shared/widgtes/map_widget.dart';
import 'package:provider/provider.dart';
import '../../../../core/constants/color_constants.dart';
import '../../../../core/di/di.dart';
import '../../../../core/location/data/location_service.dart';
import '../../../../core/network/direction_service.dart';
import '../../../../core/session/session_controller.dart';
import '../../../../core/socket/modules/rescuer_socket.dart';
import '../../../../core/utils/app_snackbar.dart';
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
import '../../../emergency_amenities/presentation/providers/amenity_provider.dart';
import '../../../emergency_amenities/presentation/widgets/amenity_category_chips.dart';
import '../../../emergency_amenities/presentation/widgets/amenity_detail_bottom_sheet.dart';
import '../../../emergency_amenities/presentation/amenity_icon_helper.dart';
import '../../../dangerous_points/presentation/providers/geofence_provider.dart';
import '../../../../shared/widgtes/geofence_alert_dialog.dart';
import '../../../../shared/providers/map_layer_provider.dart';
import '../../../../shared/widgtes/map_layer_toggle_widget.dart';
import 'package:geolocator/geolocator.dart';

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
    getIt<RescuerSocket>().listenSosOffer();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      if (mounted) {
        getIt<RescuerSocket>().listenSosOffer();
        context.read<AmenityProvider>().fetchCategories();
        context.read<AmenityProvider>().fetchAmenities();
        _onSessionOrProviderChanged();
        final sessionController = getIt<SessionController>();
        var pos = sessionController.state.position;
        pos ??= await LocationService().getCurrentPosition();
        await getIt<GeofenceProvider>().loadApprovedPoints(
          userLat: pos?.latitude,
          userLng: pos?.longitude,
        );
      }
    });
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

  Future<void> _moveToCurrentLocation() async {
    final session = getIt<SessionController>();
    
    // 1. Phản hồi tức thì 0ms: Chuyển bản đồ đến vị trí hiện có trong máy ngay lần bấm đầu tiên
    var initialPos = session.state.position;
    initialPos ??= await LocationService().getCurrentPosition();

    if (initialPos != null && mounted) {
      session.updatePosition(initialPos);
      final destLatLng = LatLng(initialPos.latitude, initialPos.longitude);
      final currentZoom = _mapController.camera.zoom;
      final destZoom = currentZoom < 15.5 ? 16.5 : currentZoom;
      _animatedMapMove(destLatLng, destZoom);
    }

    // 2. Chạy ngầm đọc GPS tươi mới nhất từ phần cứng và tự động cập nhật lại nếu tọa độ thay đổi
    try {
      final freshPosition = await LocationService().getFreshPosition();
      if (freshPosition != null && mounted) {
        session.updatePosition(freshPosition);
        final freshLatLng = LatLng(freshPosition.latitude, freshPosition.longitude);
        final currentZoom = _mapController.camera.zoom;
        final destZoom = currentZoom < 15.5 ? 16.5 : currentZoom;
        _animatedMapMove(freshLatLng, destZoom);
      }
    } catch (e) {
      debugPrint("⚠️ [RescuerMap] Lỗi lấy GPS tươi: $e");
    }
  }

  List<LatLng> _routePoints = [];
  LatLng? _lastStart;
  LatLng? _lastEnd;
  double? _distanceKm;    // Khoảng cách còn lại đến nạn nhân (km)
  int? _durationSec;      // Thời gian di chuyển ước tính (giây)
  bool _hasFittedCamera = false; // Đã fit camera cho ca cứu hộ này chưa

  DateTime? _lastRouteFetchTime;

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
        AppSnackBar.show(
          context,
          cancelledNotice,
          type: AppSnackBarType.warning,
          duration: const Duration(seconds: 4),
        );
        sosProvider.clearCancelledNotice();
      });
    }

    final suspendedNotice = sosProvider.suspendedNotice;
    if (suspendedNotice != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        AppSnackBar.show(
          context,
          suspendedNotice,
          type: AppSnackBarType.error,
          duration: const Duration(seconds: 6),
        );
        sosProvider.clearSuspendedNotice();
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
        _distanceKm = null;
        _durationSec = null;
        _hasFittedCamera = false;
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
      final info = await DirectionService().getRouteInfo(start, end);
      if (mounted && info != null && info.points.isNotEmpty) {
        setState(() {
          _routePoints = info.points;
          _distanceKm = info.distanceKm;
          _durationSec = info.durationSec;
        });

        // Fit camera bao phủ cả cứu hộ viên và nạn nhân trong lần tải đường đầu tiên
        if (!_hasFittedCamera) {
          _hasFittedCamera = true;
          try {
            _mapController.fitCamera(
              CameraFit.bounds(
                bounds: LatLngBounds.fromPoints([start, end]),
                padding: const EdgeInsets.fromLTRB(60, 180, 60, 240),
              ),
            );
          } catch (e) {
            debugPrint("⚠️ Lỗi fit camera: $e");
          }
        }
      }
    } catch (e) {
      debugPrint("⚠️ [RescuerMap] Lỗi lấy tuyến đường: $e");
    }
  }

  List<Marker> _buildDangerousPointMarkers(Position? currentPos) {
    final points = getIt<GeofenceProvider>().approvedPoints.where((pt) => pt.isEligibleToShow).toList();

    return points.map((pt) {
      final level = pt.dangerLevel;
      Color bgColor;
      Color shadowColor;
      IconData iconData;

      if (level == 'HIGH') {
        bgColor = ColorConstants.dangerHigh;
        shadowColor = ColorConstants.shadowHigh;
        iconData = Icons.dangerous_rounded;
      } else if (level == 'MEDIUM') {
        bgColor = ColorConstants.dangerMedium;
        shadowColor = ColorConstants.shadowMedium;
        iconData = Icons.warning_amber_rounded;
      } else {
        bgColor = ColorConstants.amenityGreen;
        shadowColor = ColorConstants.shadowLow;
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
              border: Border.all(color: ColorConstants.surfaceWhite, width: 2),
              boxShadow: [
                BoxShadow(color: shadowColor, blurRadius: 6, spreadRadius: 1, offset: const Offset(0, 2)),
              ],
            ),
            child: Icon(iconData, color: ColorConstants.surfaceWhite, size: 20),
          ),
        ),
      );
    }).toList();
  }

  List<Marker> _buildAmenityMarkers(BuildContext context) {
    final amenityProvider = context.watch<AmenityProvider>();
    final amenities = amenityProvider.amenities.where((item) => item.isEligibleToShow).toList();

    return amenities.map((item) {
      final icon = AmenityIconHelper.iconFor(item.iconName, categoryName: item.categoryName);
      final iconColor = AmenityIconHelper.colorFor(item.iconName, categoryName: item.categoryName);
      return Marker(
        point: LatLng(item.latitude, item.longitude),
        width: 38,
        height: 38,
        child: GestureDetector(
          onTap: () {
            showModalBottomSheet(
              context: context,
              backgroundColor: Colors.transparent,
              builder: (_) => AmenityDetailBottomSheet(amenity: item),
            );
          },
          child: Container(
            decoration: BoxDecoration(
              color: iconColor,
              shape: BoxShape.circle,
              border: Border.all(color: ColorConstants.surfaceWhite, width: 2),
              boxShadow: const [
                BoxShadow(
                  color: ColorConstants.shadowPrimary,
                  blurRadius: 6,
                  spreadRadius: 1,
                  offset: Offset(0, 2),
                ),
              ],
            ),
            child: Icon(
              icon,
              color: ColorConstants.surfaceWhite,
              size: 20,
            ),
          ),
        ),
      );
    }).toList();
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
    final mapLayerProvider = context.watch<MapLayerProvider>();

    if (currentSOS != null) {
      debugPrint("Bên screen đã nhận! ${currentSOS.toString()}");
    }

    // Lấy isOnline
    final isOnline = session.isOnline;
    final isProcessing = session.isProcessing;

    return Scaffold(
      resizeToAvoidBottomInset: false,
      body: Stack(
        children: [
          ListenableBuilder(
            listenable: getIt<GeofenceProvider>(),
            builder: (context, _) {
              return RepaintBoundary(
                child: MapWidget(
                  mapController: _mapController,
                  position: position,
                  partnerPosition: isRescuing && activeRescue != null
                      ? LatLng(activeRescue.victimLat, activeRescue.victimLng)
                      : null,
                  partnerMarkerChild: const Icon(Icons.location_on, color: ColorConstants.redRescue, size: 40),
                  additionalMarkers: [
                    if (mapLayerProvider.showDangerousPoints) ..._buildDangerousPointMarkers(position),
                    if (mapLayerProvider.showAmenities) ..._buildAmenityMarkers(context),
                  ],
                  polylines: [
                    if (context.watch<AmenityProvider>().isNavigating && context.watch<AmenityProvider>().routePoints.isNotEmpty)
                      Polyline(
                        points: context.watch<AmenityProvider>().routePoints,
                        strokeWidth: 5.0,
                        color: ColorConstants.secondary,
                      ),
                    if (isRescuing && _routePoints.isNotEmpty)
                      Polyline(
                        points: _routePoints,
                        strokeWidth: 5.0,
                        color: ColorConstants.primary,
                      ),
                  ],
                ),
              );
            },
          ),

          // ================= IN-APP AMENITY NAVIGATION BANNER =================
          Consumer<AmenityProvider>(
            builder: (context, amenityProv, _) {
              if (!amenityProv.isNavigating || amenityProv.activeNavigationAmenity == null) {
                return const SizedBox.shrink();
              }
              final target = amenityProv.activeNavigationAmenity!;
              final dist = amenityProv.routeDistanceKm?.toStringAsFixed(1) ?? '--';
              final duration = amenityProv.routeDurationSec != null ? (amenityProv.routeDurationSec! / 60).ceil() : '--';

              return Positioned(
                top: 155,
                left: 16,
                right: 16,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: ColorConstants.surfaceWhite,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: const [BoxShadow(color: ColorConstants.shadowDark, blurRadius: 10, offset: Offset(0, 4))],
                    border: Border.all(color: ColorConstants.secondary, width: 1.5),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: ColorConstants.secondaryLight,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.directions_car_rounded, color: ColorConstants.secondary, size: 24),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              target.categoryName ?? 'Tiện ích khẩn cấp',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: ColorConstants.textPrimary),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Khoảng cách: $dist km • Tuyến đường: ~$duration phút',
                              style: TextStyle(fontSize: 12, color: ColorConstants.textSecondary, fontWeight: FontWeight.w500),
                            ),
                          ],
                        ),
                      ),
                      InkWell(
                        onTap: () => context.read<AmenityProvider>().stopInAppNavigation(),
                        borderRadius: BorderRadius.circular(14),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: ColorConstants.dangerLight,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: ColorConstants.dangerBorder),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.close_rounded, size: 16, color: ColorConstants.dangerText),
                              const SizedBox(width: 4),
                              const Text(
                                'Tắt chỉ đường',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: ColorConstants.dangerText,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),

          // ================= TOP UI =================
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                child: Column(
                  children: [
                    if (!isRescuing) ...[
                      const SearchWidget(),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Expanded(
                            child: AmenityCategoryChips(),
                          ),
                          SizedBox(width: 8),
                          LayerWidget(),
                        ],
                      ),
                    ],
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
                        distanceKm: _distanceKm,
                        durationSec: _durationSec,
                        onComplete: () {
                          getIt<RescuerSocket>().completeRescue(activeRescue.sosId);
                          sosProvider.endRescue();
                        },
                        onCancel: (reason) {
                          getIt<RescuerSocket>().cancelRescue(activeRescue.sosId, reason);
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
                                        if (provider.error != null) {
                                          if (context.mounted) {
                                            AppSnackBar.show(
                                              context,
                                              provider.error!,
                                              type: AppSnackBarType.error,
                                            );
                                            provider.clearError();
                                          }
                                        }
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
                  color: ColorConstants.successLight,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: ColorConstants.success, width: 1.5),
                  boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 10)],
                ),
                child: Row(
                  children: [
                    const Icon(Icons.stars, color: ColorConstants.success, size: 28),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Text(
                        "Cứu hộ thành công! Tuyệt vời.",
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: ColorConstants.success,
                          fontSize: 15,
                        ),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: ColorConstants.success),
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