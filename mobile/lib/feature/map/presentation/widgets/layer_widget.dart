import 'package:flutter/material.dart';

class LayerWidget extends StatefulWidget {
  const LayerWidget({super.key});

  @override
  State<LayerWidget> createState() => _LayerWidgetState();
}

class _LayerWidgetState extends State<LayerWidget> {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 50,
      width: 50,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.black.withValues(alpha: 0.06)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.10),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: IconButton(
        tooltip: 'Layer',
        icon: const Icon(Icons.layers_outlined),
        color: const Color(0xFF0F172A),
        onPressed: () {},
      ),
    );
  }
}
