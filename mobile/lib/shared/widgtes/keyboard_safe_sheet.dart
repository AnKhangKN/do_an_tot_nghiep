import 'package:flutter/material.dart';

class KeyboardSafeSheet extends StatelessWidget {
  final Widget child;

  const KeyboardSafeSheet({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return MediaQuery.removeViewInsets(
      removeBottom: true,
      context: context,
      child: ConstrainedBox(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.sizeOf(context).height * 0.85,
        ),
        child: RepaintBoundary(child: child),
      ),
    );
  }
}
