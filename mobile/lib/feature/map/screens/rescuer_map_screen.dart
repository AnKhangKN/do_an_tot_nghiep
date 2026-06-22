import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:mobile/feature/map/widgets/go_online_button_widget.dart';
import 'package:mobile/feature/map/widgets/rescuer_util_widget.dart';

import '../../../core/constants/app_constants.dart';
import '../widgets/layer_widget.dart';
import '../widgets/search_widget.dart';

class RescuerMapScreen extends StatefulWidget {
  const RescuerMapScreen({super.key});

  @override
  State<RescuerMapScreen> createState() => _RescuerMapScreenState();
}

class _RescuerMapScreenState extends State<RescuerMapScreen> {
  bool isOnline = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [

          // Map
          FlutterMap(
            children: [
              TileLayer(
                urlTemplate: AppConstants.urlTemplate,
                userAgentPackageName: 'com.example.mobile',
              ),
            ],
          ),

          // Search & Layer
          const Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              child: Padding(
                padding: EdgeInsets.fromLTRB(16, 12, 16, 0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
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

        // Action button
          Positioned(
            left: 0,
            right: 0,
            bottom: -20,
            child: SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: SizedBox(
                  height: 180,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Align(
                        alignment: Alignment.bottomCenter,
                        child: GoOnlineButtonWidget(
                          isOnline: isOnline,
                          onTap: () {
                            setState(() {
                              isOnline = !isOnline;
                            });

                            // TODO:
                            // gọi API hoặc socket cập nhật status rescuer
                          },
                        ),
                      ),
                      SizedBox(height: 8),
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
