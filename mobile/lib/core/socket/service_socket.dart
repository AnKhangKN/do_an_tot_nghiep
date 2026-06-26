import 'package:mobile/core/constants/app_constants.dart';
import 'package:mobile/core/storage/storage_service.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

class ServiceSocket {
  final StorageService storageService;
  IO.Socket? _socket;

  ServiceSocket(this.storageService);

  Future<void> connect() async {
    final token = await storageService.getAccessToken();
    print("Token cho socket: ${token}");

    if (token == null || token.isEmpty) {
      print("No access token");
      return;
    }

    // đảm bảo socket cũ được xoá sạch trước khi tạo mới
    await _cleanup();

    _socket = IO.io(
      AppConstants.baseUrl,
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .enableReconnection()
          .setReconnectionAttempts(999999)
          .setReconnectionDelay(2000)
          .setReconnectionDelayMax(5000)
          .setAuth({'token': token})
          .build(),
    );

    _socket!
      ..onConnect((_) => print("Socket connected"))
      ..onDisconnect((_) => print("Socket disconnected"))
      ..onConnectError((e) => print("Connect error: $e"))
      ..onError((e) => print("Socket error: $e"));

    _socket!.connect();
  }

  Future<void> disconnect() async {
    await _cleanup();
  }

  Future<void> _cleanup() async {
    if (_socket != null) {
      _socket!
        ..disconnect()
        ..dispose();

      _socket = null;
    }
  }

  bool get isConnected => _socket?.connected ?? false;
  IO.Socket? get raw => _socket;
}