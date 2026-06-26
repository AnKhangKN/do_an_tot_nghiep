import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:mobile/core/constants/app_constants.dart';

import '../widgets/layer_widget.dart';
import '../widgets/search_widget.dart';
import '../widgets/sos_button_widget.dart';
import '../widgets/util_widget.dart';

class MapScreen extends StatelessWidget {
  const MapScreen({super.key});

  @override
  Widget build(BuildContext context) {
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

          const Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: SafeArea(
              child: Padding(
                padding: EdgeInsets.fromLTRB(16, 0, 16, 16),
                child: SizedBox(
                  height: 160,
                  child: Stack(
                    alignment: Alignment.bottomCenter,
                    children: [
                      Align(
                        alignment: Alignment.bottomCenter,
                        child: SosButtonWidget(),
                      ),
                      Align(
                        alignment: Alignment.bottomRight,
                        child: UtilWidget(),
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
