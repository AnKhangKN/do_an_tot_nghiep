import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:mobile/core/socket/service_socket.dart';

class HeartbeatSocket {
  final ServiceSocket core;

  Timer? _timer;

  HeartbeatSocket(this.core);

  void start() {
    if (_timer != null) return; // 🚨 CHẶN MULTI TIMER

    debugPrint("Heartbeat start");

    _timer = Timer.periodic(
      const Duration(seconds: 15),
          (_) {
        final socket = core.raw;

        if (socket == null || !socket.connected) return;

        debugPrint("SEND HEARTBEAT");
        socket.emit("rescuer:heartbeat");
      },
    );
  }

  void stop() {
    debugPrint("Heartbeat stop");

    _timer?.cancel();
    _timer = null;
  }
}