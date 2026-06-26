import 'package:flutter/material.dart';

import '../socket/index_socket.dart';

class AppSession {
  final IndexSocket socket;

  AppSession(this.socket);

  Future<void> start({bool isRescuer = false}) async {
    debugPrint("=== APP SESSION START ===");

    await socket.core.connect();

    if (isRescuer) {
      socket.heartbeat.start();
    }
  }

  Future<bool> goOnline() async {
    socket.rescuerSocket.goOnline();
    return true;
  }

  Future<bool> goOffline() async {
    socket.rescuerSocket.goOffline();
    return true;
  }

  Future<void> stop() async {
    socket.heartbeat.stop();
    await socket.core.disconnect();
  }
}