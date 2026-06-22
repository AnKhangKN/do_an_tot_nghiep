import 'service_socket.dart';
import 'events_socket.dart';

class DispatchSocket {
  final ServiceSocket _serviceSocket;

  DispatchSocket(this._serviceSocket);

  void listenSOS(Function(dynamic data) onSOS) {
    _serviceSocket.socket?.on(EventsSocket.newSOS, onSOS);
  }

  void acceptSOS(String sosId, String rescuerId) {
    _serviceSocket.socket?.emit(EventsSocket.acceptSOS, {
      "sosId": sosId,
      "rescuerId": rescuerId,
    });
  }
}