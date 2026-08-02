import 'package:flutter/material.dart';
import '../../../core/constants/color_constants.dart';

/// Helper tập trung ánh xạ icon danh mục tiện ích (`icon_name` từ API)
/// sang Material IconData + màu sắc.
///
/// Ưu tiên dùng key chuẩn (medical/fire/police/gas/repair/shelter/food/store);
/// nếu không có thì fallback theo keyword tiếng Việt trong tên danh mục
/// (hỗ trợ dữ liệu cũ chưa đặt icon).
class AmenityIconHelper {
  static const Map<String, IconData> _icons = {
    'medical': Icons.medical_services_rounded,
    'fire': Icons.local_fire_department_rounded,
    'police': Icons.local_police_rounded,
    'gas': Icons.local_gas_station_rounded,
    'repair': Icons.build_circle_rounded,
    'shelter': Icons.night_shelter_rounded,
    'food': Icons.rice_bowl_rounded,
    'store': Icons.storefront_rounded,
  };

  static const Map<String, Color> _colors = {
    'medical': Color(0xFFDC2626),
    'fire': Color(0xFFEA580C),
    'police': Color(0xFF2563EB),
    'gas': Color(0xFFD97706),
    'repair': Color(0xFFF97316),
    'shelter': Color(0xFF059669),
    'food': Color(0xFF0D9488),
    'store': Color(0xFF6B7280),
  };

  static const Map<String, String> _aliases = {
    'wrench': 'repair',
    'gas-pump': 'gas',
    'first-aid': 'medical',
    'tire': 'repair',
  };

  /// Chuẩn hóa giá trị icon từ API về key hợp lệ (mặc định 'store').
  static String normalize(String? iconName) {
    final value = (iconName ?? '').trim().toLowerCase();
    if (_icons.containsKey(value)) return value;
    return _aliases[value] ?? 'store';
  }

  /// Trả về [IconData] theo iconName; fallback keyword theo [categoryName].
  static IconData iconFor(String? iconName, {String? categoryName}) {
    final key = normalize(iconName);
    if (key != 'store') return _icons[key]!;

    final name = (categoryName ?? '').toLowerCase();
    if (name.contains('y tế') || name.contains('bệnh viện') || name.contains('thuốc') || name.contains('cấp cứu')) {
      return Icons.medical_services_rounded;
    }
    if (name.contains('trú ẩn') || name.contains('sơ tán') || name.contains('nhà')) {
      return Icons.night_shelter_rounded;
    }
    if (name.contains('sửa') || name.contains('xe') || name.contains('cứu hộ')) {
      return Icons.build_circle_rounded;
    }
    if (name.contains('ăn') || name.contains('nước') || name.contains('thực phẩm')) {
      return Icons.rice_bowl_rounded;
    }
    if (name.contains('cháy') || name.contains('cứu hỏa')) {
      return Icons.local_fire_department_rounded;
    }
    if (name.contains('xăng') || name.contains('nhiên liệu')) {
      return Icons.local_gas_station_rounded;
    }
    if (name.contains('công an') || name.contains('cảnh sát')) {
      return Icons.local_police_rounded;
    }
    return Icons.storefront_rounded;
  }

  /// Trả về màu theo iconName; fallback keyword theo [categoryName].
  static Color colorFor(String? iconName, {String? categoryName}) {
    final key = normalize(iconName);
    if (key != 'store') return _colors[key]!;

    final name = (categoryName ?? '').toLowerCase();
    if (name.contains('y tế') || name.contains('bệnh viện') || name.contains('cấp cứu')) {
      return ColorConstants.danger;
    }
    if (name.contains('trú ẩn') || name.contains('sơ tán')) {
      return ColorConstants.purpleQR;
    }
    if (name.contains('sửa') || name.contains('cứu hộ')) {
      return ColorConstants.dangerMedium;
    }
    return ColorConstants.amenityGreen;
  }
}
