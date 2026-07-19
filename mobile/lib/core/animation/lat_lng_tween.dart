import 'package:flutter/animation.dart';
import 'package:latlong2/latlong.dart';

/// Tween dùng để nội suy mượt mà giữa hai tọa độ LatLng.
/// Thường dùng kết hợp với AnimationController để cập nhật marker di chuyển mượt mà trên bản đồ.
class LatLngTween extends Tween<LatLng> {
  LatLngTween({super.begin, super.end});

  @override
  LatLng lerp(double t) {
    if (begin == null) return end ?? const LatLng(0, 0);
    if (end == null) return begin!;

    final lat = begin!.latitude + (end!.latitude - begin!.latitude) * t;
    final lng = begin!.longitude + (end!.longitude - begin!.longitude) * t;
    return LatLng(lat, lng);
  }
}
