import 'package:flutter/material.dart';
import 'package:mobile/core/socket/rescuer_socket.dart';
import 'package:mobile/core/storage/storage_service.dart';
import 'package:mobile/core/socket/heartbeat_socket.dart';

import 'service_socket.dart';
import 'location_socket.dart';

class IndexSocket {
  late final ServiceSocket core;

  late final LocationSocket location;
  late final HeartbeatSocket heartbeat;
  late final RescuerSocket rescuerSocket;

  IndexSocket(StorageService storageService) {
    core = ServiceSocket(storageService);

    location = LocationSocket(core);
    heartbeat = HeartbeatSocket(core);
    rescuerSocket = RescuerSocket(core);
  }
}