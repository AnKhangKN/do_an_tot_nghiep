import 'dart:async';
import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../constants/app_constants.dart';

class CoreSocket {
  IO.Socket? _socket;

  bool _isConnected = false;

  bool get isConnected => _isConnected;

  Completer<void>? _connectCompleter;

  void connect(String token) {
    if (_socket != null) return;

    _connectCompleter ??= Completer<void>();

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
      ..onConnect((_) {
        print("Socket connected");

        _isConnected = true;

        if (_connectCompleter != null &&
            !_connectCompleter!.isCompleted) {
          _connectCompleter!.complete();
        }
      })
      ..onDisconnect((_) {
        print("Socket disconnected");
        _isConnected = false;
      })
      ..onConnectError((e) {
        print("Connect error: $e");

        if (_connectCompleter != null &&
            !_connectCompleter!.isCompleted) {
          _connectCompleter!.completeError(e);
        }
      })
      ..onError((e) {
        print("Socket error: $e");
      });

    _socket!.connect();
  }

  Future<void> ensureConnected(String token) async {
    disconnect();

    connect(token);

    await _connectCompleter?.future;
  }

  void disconnect() {
    _connectCompleter = null;

    _isConnected = false;

    _socket
      ?..disconnect()
      ..dispose();

    _socket = null;
  }

  void emit(String event, [dynamic data]) {
    _socket?.emit(event, data);
  }

  void on(String event, void Function(dynamic) handler) {
    _socket?.on(event, handler);
  }

  void off(String event) {
    _socket?.off(event);
  }
}