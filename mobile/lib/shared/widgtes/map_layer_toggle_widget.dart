import 'package:flutter/material.dart';
import 'layer_widget.dart';

class MapLayerToggleWidget extends StatelessWidget {
  const MapLayerToggleWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return const Align(
      alignment: Alignment.centerRight,
      child: LayerWidget(),
    );
  }
}
