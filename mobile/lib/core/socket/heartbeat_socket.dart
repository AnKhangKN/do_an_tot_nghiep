import 'dart:async';
import 'package:mobile/core/socket/service_socket.dart';

class HeartbeatSocket {
  final ServiceSocket _serviceSocket;
  Timer? _timer;

  HeartbeatSocket(this._serviceSocket);

  void start(String userId) {
    _timer?.cancel();

    _timer = Timer.periodic(const Duration(seconds: 10), (_) {
      final socket = _serviceSocket.socket;

      if (socket == null || !socket.connected) return;

      socket.emit("heartbeat", {
        "userId": userId,
      });
    });
  }

  void stop() {
    _timer?.cancel();
    _timer = null;
  }
}