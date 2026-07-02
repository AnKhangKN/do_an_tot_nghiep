import '../core_socket.dart';
import '../socket_events.dart';

class RescuerSocket {
  final CoreSocket socket;

  RescuerSocket(this.socket);

  void listenRescueRequests(Function(dynamic) onRequest) {
    socket.on(SocketEvents.sosEmit, (data) {
      onRequest(data);
    });
  }

  void acceptRescue(String incidentId) {
    socket.emit(SocketEvents.rescueAccept, {
      "incidentId": incidentId,
    });
  }

  void rejectRescue(String incidentId) {
    socket.emit(SocketEvents.rescueReject, {
      "incidentId": incidentId,
    });
  }

  void completeRescue(String incidentId) {
    socket.emit(SocketEvents.rescueComplete, {
      "incidentId": incidentId,
    });
  }

  void stopListening() {
    socket.off(SocketEvents.sosEmit);
  }
}