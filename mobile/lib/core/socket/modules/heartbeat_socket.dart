import 'package:flutter/material.dart';

import '../core_socket.dart';
import '../socket_events.dart';
import 'dart:async';

class HeartbeatSocket {
  final CoreSocket socket;

  Timer? _timer;

  HeartbeatSocket(this.socket);

  void start() {
    _timer?.cancel();

    _timer = Timer.periodic(const Duration(seconds: 15), (_) {
      debugPrint("SEND HEARTBEAT");
      socket.emit(SocketEvents.heartbeat);
    });
  }

  void stop() {
    debugPrint("Heartbeat stop");

    _timer?.cancel();
    _timer = null;
  }
}
