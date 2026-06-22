import 'package:mobile/core/socket/heartbeat_socket.dart';

import 'service_socket.dart';
import 'dispatch_socket.dart';
import 'location_socket.dart';

class IndexSocket {
  final ServiceSocket core = ServiceSocket();

  late final DispatchSocket dispatch;
  late final LocationSocket location;
  late final HeartbeatSocket heartbeat;

  IndexSocket() {
    dispatch = DispatchSocket(core);
    location = LocationSocket(core);
    heartbeat = HeartbeatSocket(core);
  }

  void connect(String token) {
    core.connect(token);
  }

  void disconnect() {
    core.disconnect();
  }
}