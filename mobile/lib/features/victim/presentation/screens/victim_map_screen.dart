import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';

import 'package:mobile/core/constants/app_constants.dart';
import '../../../../core/di/di.dart';
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

  @override
  void dispose() {
    // 🚀 ĐÃ THÊM: Giải phóng bộ nhớ đúng cách khi đóng màn hình
    _mapController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final sessionController = getIt<SessionController>();
    final position = sessionController.state.position;

    return Scaffold(
      body: Stack(
        children: [
          MapWidget(
            mapController: _mapController,
            position: position,
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
                    // 🚀 ĐÃ SỬA: Bỏ từ khóa 'const' ở đây để tránh lỗi biên dịch widget con
                    children: [
                      const Align(
                        alignment: Alignment.bottomCenter,
                        child: VictimSosButtonWidget(),
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
        ],
      ),
    );
  }
}