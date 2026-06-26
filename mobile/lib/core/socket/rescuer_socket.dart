import 'package:flutter/foundation.dart';
import 'package:mobile/core/socket/service_socket.dart';

class RescuerSocket {
  final ServiceSocket core;

  RescuerSocket(this.core);

  bool goOnline() {
    final socket = core.raw;

    if (socket == null || !socket.connected) {
      debugPrint("Socket not ready (online)");
      return false;
    }

    debugPrint("Rescuer goOnline");
    socket.emit("rescuer:online");
    return true;
  }

  bool goOffline() {
    final socket = core.raw;

    if (socket == null || !socket.connected) {
      debugPrint("Socket not ready (offline)");
      return false;
    }

    debugPrint("Rescuer goOffline");
    socket.emit("rescuer:offline");

    return true;
  }
}