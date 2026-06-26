import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_constants.dart';
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
  @override
  Widget build(BuildContext context) {
    final provider = context.watch<RescuerMapProvider>();

    return Scaffold(
      body: Stack(
        children: [
          FlutterMap(
            children: [
              TileLayer(
                urlTemplate: AppConstants.urlTemplate,
                userAgentPackageName: 'com.example.mobile',
              ),
            ],
          ),

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
                        alignment: provider.isOnline
                            ? Alignment.bottomLeft
                            : Alignment.bottomCenter,
                        child: GoOnlineButtonWidget(
                          isOnline: provider.isOnline,
                          onTap: () async {
                            if (provider.isOnline) {
                              await provider.goOffline();
                            } else {
                              await provider.goOnline();
                            }
                          },
                        ),
                      ),
                      const SizedBox(height: 8),
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