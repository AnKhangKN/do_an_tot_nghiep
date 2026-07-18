import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:mobile/shared/widgtes/map_widget.dart';
import 'package:provider/provider.dart';
import '../../../../core/di/di.dart';
import '../../../../core/network/direction_service.dart';
import '../../../../core/session/session_controller.dart';
import '../../../../core/socket/modules/rescuer_socket.dart';
import '../providers/rescuer_map_provider.dart';
import '../../../../shared/widgtes/layer_widget.dart';
import '../providers/sos_provider.dart';
import '../widgets/rescuer_go_online_button_widget.dart';
import '../widgets/rescuer_util_widget.dart';
import '../../../../shared/widgtes/search_widget.dart';
import '../widgets/sos_offer_overlay_widget.dart';
import '../../models/sos_offer_model.dart';

class RescuerMapScreen extends StatefulWidget {
  const RescuerMapScreen({super.key});

  @override
  State<RescuerMapScreen> createState() => _RescuerMapScreenState();
}

class _RescuerMapScreenState extends State<RescuerMapScreen> {
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

  void _onSessionOrProviderChanged() {
    if (!mounted) return;
    final session = getIt<SessionController>();
    final position = session.state.position;
    
    final sosProvider = getIt<SOSProvider>();
    final isRescuing = sosProvider.isRescuing;
    final activeRescue = sosProvider.activeRescue;

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
    // Lắng nghe position từ session
    final session = context.watch<SessionController>();
    final position = session.state.position;

    final sosProvider = context.watch<SOSProvider>();
    debugPrint("Mã bộ nhớ Provider lúc VẼ UI: ${sosProvider.hashCode}");
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
            additionalMarkers: isRescuing && activeRescue != null
                ? [
                    Marker(
                      point: LatLng(activeRescue.victimLat, activeRescue.victimLng),
                      width: 50,
                      height: 50,
                      alignment: Alignment.center,
                      child: const Icon(Icons.location_on, color: Colors.red, size: 40),
                    )
                  ]
                : null,
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
                    ? Container(
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
                                Icon(Icons.airport_shuttle, color: Colors.red),
                                SizedBox(width: 8),
                                Text(
                                  "Đang đi cứu nạn...",
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                    color: Colors.red,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(
                              "Nạn nhân: ${sosProvider.activeVictim?['fullName'] ?? 'Không rõ'}",
                              style: const TextStyle(fontWeight: FontWeight.w600),
                            ),
                            Text(
                              "SĐT: ${sosProvider.activeVictim?['phone'] ?? 'Không rõ'}",
                            ),
                            if (activeRescue.description != null && activeRescue.description!.isNotEmpty)
                              Text(
                                "Mô tả sự cố: ${activeRescue.description}",
                                style: const TextStyle(color: Colors.grey),
                              ),
                            const SizedBox(height: 12),
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.green,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                              onPressed: () {
                                getIt<RescuerSocket>().completeRescue(activeRescue.sosId);
                                sosProvider.endRescue();
                              },
                              child: const Center(
                                child: Text(
                                  "Hoàn thành cứu hộ",
                                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                                ),
                              ),
                            )
                          ],
                        ),
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
                color: Colors.black.withOpacity(0.5),
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