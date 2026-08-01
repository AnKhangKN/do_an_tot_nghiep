import 'package:flutter/material.dart';

class KeyboardSafeSheet extends StatelessWidget {
  final Widget child;

  const KeyboardSafeSheet({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return AnimatedPadding(
      duration: const Duration(milliseconds: 100),
      curve: Curves.decelerate,
      padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
      child: MediaQuery.removeViewInsets(
        removeBottom: true,
        context: context,
        child: ConstrainedBox(
          constraints: BoxConstraints(
            maxHeight: MediaQuery.sizeOf(context).height * 0.85,
          ),
          child: child,
        ),
      ),
    );
  }
}
