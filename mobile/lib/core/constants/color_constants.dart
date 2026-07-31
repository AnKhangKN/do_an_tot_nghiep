import 'package:flutter/material.dart';

class ColorConstants {
  /// Điều chỉnh toàn bộ màu nền/chữ/border theo sáng hoặc tối.
  static void applyBrightness(Brightness brightness) {
    final dark = brightness == Brightness.dark;
    if (dark == _isDark) return;
    _isDark = dark;

    if (dark) {
      surfaceWhite = const Color(0xFF1C1C1E);
      backgroundLight = const Color(0xFF17181C);
      bgCanvas = const Color(0xFF16181D);
      border = const Color(0xFF2C2E33);
      borderDark = const Color(0xFF3A3D42);
      borderMuted = const Color(0xFF52565C);
      divider = const Color(0xFF23252A);
      textPrimary = const Color(0xFFF2F2F7);
      textSecondary = const Color(0xFFAEAEB2);
      textMuted = const Color(0xFF9BA1A6);
      textSubtle = const Color(0xFFC7CBD1);
      slateDark = const Color(0xFFE2E8F0);
      primaryLight = const Color(0xFF1E2A4A);
      secondaryLight = const Color(0xFF0F2A3D);
      amenityGreenLight = const Color(0xFF0F2E24);
      dangerHighLight = const Color(0xFF3A1212);
      successLight = const Color(0xFF10231B);
      dangerLight = const Color(0xFF331515);
      dangerBorder = const Color(0xFF5A2323);
      warningLight = const Color(0xFF332B09);
    } else {
      surfaceWhite = Colors.white;
      backgroundLight = const Color(0xFFF5F5F5);
      bgCanvas = const Color(0xFFF9FAFB);
      border = const Color(0xFFE5E7EB);
      borderDark = const Color(0xFFD1D5DB);
      borderMuted = const Color(0xFF9CA3AF);
      divider = const Color(0xFFF3F4F6);
      textPrimary = const Color(0xFF212121);
      textSecondary = const Color(0xFF757575);
      textMuted = const Color(0xFF6B7280);
      textSubtle = const Color(0xFF4B5563);
      slateDark = const Color(0xFF0F172A);
      primaryLight = const Color(0xFFEFF6FF);
      secondaryLight = const Color(0xFFE0F2FE);
      amenityGreenLight = const Color(0xFFD1FAE5);
      dangerHighLight = const Color(0xFFFEE2E2);
      successLight = const Color(0xFFECFDF5);
      dangerLight = const Color(0xFFFEF2F2);
      dangerBorder = const Color(0xFFFECACA);
      warningLight = const Color(0xFFFDE68A);
    }
  }

  static bool _isDark = false;

  // Màu chủ đạo Cứu hộ & Brand
  static const Color redRescue = Color(0xFFE53935); // Đỏ khẩn cấp
  static const Color orangeWarning = Color(0xFFFF9800); // Cam cảnh báo
  static const Color yellowCaution = Color(0xFFFFEB3B); // Vàng lưu ý

  static const Color primary = Color(0xFF2563EB); // Royal Blue
  static const Color primaryDark = Color(0xFF1D4ED8);
  static Color primaryLight = const Color(0xFFEFF6FF);

  static const Color secondary = Color(0xFF0284C7); // Sky Blue (Chỉ đường In-App)
  static Color secondaryLight = const Color(0xFFE0F2FE);

  static Color slateDark = const Color(0xFF0F172A); // Dark Slate (Text/Icons)
  static const Color purpleQR = Color(0xFF9333EA); // Purple QR Code

  // Màu Tiện ích & Điểm Nguy Hiểm
  static const Color amenityGreen = Color(0xFF10B981); // Emerald Green
  static Color amenityGreenLight = const Color(0xFFD1FAE5);
  static const Color dangerHigh = Color(0xFFDC2626); // Red High Danger
  static Color dangerHighLight = const Color(0xFFFEE2E2);
  static const Color dangerMedium = Color(0xFFF97316); // Orange Medium Danger

  // Màu bóng đổ (Shadows)
  static const Color shadowHigh = Color(0x66DC2626);
  static const Color shadowMedium = Color(0x66F97316);
  static const Color shadowLow = Color(0x6610B981);
  static const Color shadowPrimary = Color(0x402563EB);
  static const Color shadowDark = Color(0x1A000000); // Black 10%

  // Màu nền & Tương phản
  static const Color backgroundDark = Color(0xFF121212); // Nền tối cho tương phản cao
  static Color backgroundLight = const Color(0xFFF5F5F5);
  static Color surfaceWhite = Colors.white;
  static Color bgCanvas = const Color(0xFFF9FAFB); // Gray 50
  static Color border = const Color(0xFFE5E7EB); // Gray 200
  static Color borderDark = const Color(0xFFD1D5DB); // Gray 300
  static Color borderMuted = const Color(0xFF9CA3AF); // Gray 400
  static Color divider = const Color(0xFFF3F4F6); // Gray 100

  // Trạng thái
  static const Color success = Color(0xFF4CAF50);
  static Color successLight = const Color(0xFFECFDF5);
  static const Color info = Color(0xFF2196F3);
  static const Color error = Color(0xFFD32F2F);
  static const Color danger = Color(0xFFEF4444);
  static Color dangerLight = const Color(0xFFFEF2F2);
  static Color dangerBorder = const Color(0xFFFECACA);
  static const Color dangerText = Color(0xFFB91C1C);
  static const Color warningDark = Color(0xFF78350F); // Amber 900
  static Color warningLight = const Color(0xFFFDE68A); // Amber Accent

  // Chữ (Typography)
  static Color textPrimary = const Color(0xFF212121);
  static Color textSecondary = const Color(0xFF757575);
  static const Color textOnDark = Colors.white;
  static Color textMuted = const Color(0xFF6B7280); // Gray 500 / 600
  static Color textSubtle = const Color(0xFF4B5563); // Gray 700
}
