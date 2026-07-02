import '../core_socket.dart';
import '../socket_events.dart';

class LocationSocket {
  final CoreSocket socket;

  LocationSocket(this.socket);

  void sendLocation({
    required double lat,
    required double lng,
  }) {
    socket.emit(SocketEvents.locationUpdate, {
      "lat": lat,
      "lng": lng
    });
  }
}