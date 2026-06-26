import 'dart:async';
import 'package:mobile/core/socket/service_socket.dart';

class LocationSocket {
  final ServiceSocket _serviceSocket;
  Timer? _timer;

  double? _lat;
  double? _lng;

  LocationSocket(this._serviceSocket);

  void start(String userId) {
    _timer?.cancel();

    _timer = Timer.periodic(const Duration(seconds: 5), (_) {
      final socket = _serviceSocket.raw;

      if (socket == null || !socket.connected) return;
      if (_lat == null || _lng == null) return;

      socket.emit("rescuer:location_update", {
        "lat": _lat,
        "lng": _lng,
      });
    });
  }

  void updateLocation(double lat, double lng) {
    _lat = lat;
    _lng = lng;
  }

  void stop() {
    _timer?.cancel();
    _timer = null;
  }
}