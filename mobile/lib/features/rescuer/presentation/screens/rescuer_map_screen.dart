import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:mobile/shared/widgtes/map_widget.dart';
import 'package:provider/provider.dart';
import '../../../../core/session/session_controller.dart';
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
  void dispose() {
    _mapController.dispose();
    super.dispose();
  }

  // Xử lý tạm thời khi bấm NHẬN CUỐC (Chỉ tắt Pop-up để test UI)
  void _handleAcceptUI(SOSOfferModel sos, SOSProvider sosProvider) {
    debugPrint("🚀 [TEST UI] Đã bấm NHẬN CUỐC ID: ${sos.sosId}");
    sosProvider.clearSOS(); // Tắt bảng thông báo
  }

  // Xử lý tạm thời khi bấm TỪ CHỐI / HẾT GIỜ (Chỉ tắt Pop-up để test UI)
  void _handleRejectUI(SOSOfferModel sos, SOSProvider sosProvider) {
    debugPrint("❌ [TEST UI] Đã BỎ QUA cuốc ID: ${sos.sosId}");
    sosProvider.clearSOS(); // Tắt bảng thông báo
  }

  @override
  Widget build(BuildContext context) {
    // Lắng nghe position từ session
    final session = context.watch<SessionController>();
    final position = session.state.position;

    final sosProvider = context.watch<SOSProvider>();
    debugPrint("Mã bộ nhớ Provider lúc VẼ UI: ${sosProvider.hashCode}");
    final currentSOS = sosProvider.currentSOS;

    if (currentSOS != null) {
      debugPrint("Bên screen đã nhận! ${currentSOS.toString()}");
    }

    // Lấy isOnline
    final isOnline = session.isOnline;
    final isProcessing = session.isProcessing;

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