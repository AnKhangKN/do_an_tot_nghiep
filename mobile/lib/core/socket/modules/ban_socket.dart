import 'package:mobile/core/session/session_controller.dart';
import 'package:mobile/core/socket/core_socket.dart';
import 'package:mobile/core/socket/socket_events.dart';

class BanSocket {
  final CoreSocket _socket;
  final SessionController _sessionController;

  BanSocket(this._socket, this._sessionController);

  void listenUserBanned() {
    _socket.on(SocketEvents.userBanned, (data) {
      if (data is Map) {
        final reason = data['reason']?.toString();
        _sessionController.setBanned(reason: reason);
      } else {
        _sessionController.setBanned();
      }
    });
  }

  void stopListening() {
    _socket.off(SocketEvents.userBanned);
  }
}
