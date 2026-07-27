import 'package:flutter/material.dart';

class ColorConstants {
  // Màu chủ đạo Cứu hộ & Brand
  static const Color redRescue = Color(0xFFE53935); // Đỏ khẩn cấp
  static const Color orangeWarning = Color(0xFFFF9800); // Cam cảnh báo
  static const Color yellowCaution = Color(0xFFFFEB3B); // Vàng lưu ý

  static const Color primary = Color(0xFF2563EB); // Royal Blue
  static const Color primaryDark = Color(0xFF1D4ED8);
  static const Color primaryLight = Color(0xFFEFF6FF);

  static const Color secondary = Color(0xFF0284C7); // Sky Blue (Chỉ đường In-App)
  static const Color secondaryLight = Color(0xFFE0F2FE);

  static const Color slateDark = Color(0xFF0F172A); // Dark Slate (Text/Icons)
  static const Color purpleQR = Color(0xFF9333EA); // Purple QR Code

  // Màu Tiện ích & Điểm Nguy Hiểm
  static const Color amenityGreen = Color(0xFF10B981); // Emerald Green
  static const Color amenityGreenLight = Color(0xFFD1FAE5);
  static const Color dangerHigh = Color(0xFFDC2626); // Red High Danger
  static const Color dangerHighLight = Color(0xFFFEE2E2);
  static const Color dangerMedium = Color(0xFFF97316); // Orange Medium Danger

  // Màu bóng đổ (Shadows)
  static const Color shadowHigh = Color(0x66DC2626);
  static const Color shadowMedium = Color(0x66F97316);
  static const Color shadowLow = Color(0x6610B981);
  static const Color shadowPrimary = Color(0x402563EB);
  static const Color shadowDark = Color(0x1A000000); // Black 10%

  // Màu nền & Tương phản
  static const Color backgroundDark = Color(0xFF121212); // Nền tối cho tương phản cao
  static const Color backgroundLight = Color(0xFFF5F5F5); 
  static const Color surfaceWhite = Colors.white;
  static const Color bgCanvas = Color(0xFFF9FAFB); // Gray 50
  static const Color border = Color(0xFFE5E7EB); // Gray 200
  static const Color borderDark = Color(0xFFD1D5DB); // Gray 300
  static const Color borderMuted = Color(0xFF9CA3AF); // Gray 400
  static const Color divider = Color(0xFFF3F4F6); // Gray 100
  
  // Trạng thái
  static const Color success = Color(0xFF4CAF50);
  static const Color successLight = Color(0xFFECFDF5);
  static const Color info = Color(0xFF2196F3);
  static const Color error = Color(0xFFD32F2F);
  static const Color danger = Color(0xFFEF4444);
  static const Color dangerLight = Color(0xFFFEF2F2);
  static const Color dangerBorder = Color(0xFFFECACA);
  static const Color dangerText = Color(0xFFB91C1C);
  static const Color warningDark = Color(0xFF78350F); // Amber 900
  static const Color warningLight = Color(0xFFFDE68A); // Amber Accent

  // Chữ (Typography)
  static const Color textPrimary = Color(0xFF212121);
  static const Color textSecondary = Color(0xFF757575);
  static const Color textOnDark = Colors.white;
  static const Color textMuted = Color(0xFF6B7280); // Gray 500 / 600
  static const Color textSubtle = Color(0xFF4B5563); // Gray 700
}
