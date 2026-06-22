import 'package:socket_io_client/socket_io_client.dart' as IO;

class ServiceSocket {
  IO.Socket? socket;

  void connect(String token) {
    socket = IO.io(
      'http://server',
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .setExtraHeaders({'Authorization': 'Bearer $token'})
          .build(),
    );

    socket!.connect();
  }

  void disconnect() => socket?.disconnect();
}