import 'dart:async';

import 'package:geolocator/geolocator.dart';

import '../../session/session_controller.dart';
import 'location_service.dart';

class LocationRepository {
  final LocationService _locationService;
  final SessionController _sessionController;

  StreamSubscription<Position>? _subscription;

  LocationRepository(
      this._locationService,
      this._sessionController,
      );

  // Lấy vị trí lần đầu
  Future<void> loadCurrentPosition() async {
    final position =
    await _locationService.getCurrentPosition();

    if (position != null) {
      _sessionController.updatePosition(position);
    }
  }

  // bắt đầu lây vị trí realtime
  Future<Stream<Position>?> startTracking() async {
    final granted = await _locationService.ensureLocationPermission();

    if (!granted) return null;

    // Chỉ trả về Stream thô của phần cứng, không "listen" ở đây nữa
    return _locationService.getPositionStream();
  }
}