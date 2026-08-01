import 'package:flutter/material.dart';

import '../constants/color_constants.dart';

enum AppSnackBarType { success, error, warning, info }

class AppSnackBar {
  static void show(
    BuildContext context,
    String message, {
    AppSnackBarType type = AppSnackBarType.info,
    Duration duration = const Duration(seconds: 3),
    SnackBarAction? action,
  }) {
    final Color backgroundColor;
    switch (type) {
      case AppSnackBarType.success:
        backgroundColor = ColorConstants.success;
      case AppSnackBarType.error:
        backgroundColor = ColorConstants.error;
      case AppSnackBarType.warning:
        backgroundColor = ColorConstants.orangeWarning;
      case AppSnackBarType.info:
        backgroundColor = ColorConstants.info;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: backgroundColor,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        content: Text(
          message,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        action: action,
        duration: duration,
      ),
    );
  }
}
