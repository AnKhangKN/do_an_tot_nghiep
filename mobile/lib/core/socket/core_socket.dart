import 'dart:async';
import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../constants/app_constants.dart';

class CoreSocket {
  // Biến thành Singleton để đảm bảo dùng chung 1 instance trong toàn app
  static final CoreSocket _instance = CoreSocket._internal();
  factory CoreSocket() => _instance;
  CoreSocket._internal();

  IO.Socket? _socket;
  bool _isConnected = false;
  bool get isConnected => _isConnected;

  Completer<void>? _connectCompleter;

  void connect(String token, String userId, String role) {
    // Nếu socket đang kết nối hoặc đã kết nối rồi thì KHÔNG tạo mới
    if (_socket != null && (_socket!.connected || _socket!.active)) {
      debugPrint("⚠️ Socket đã tồn tại và đang hoạt động.");
      return;
    }

    _connectCompleter = Completer<void>();

    _socket = IO.io(
      AppConstants.baseUrl,
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .enableReconnection()
          .setReconnectionAttempts(999999)
          .setReconnectionDelay(2000)
          .setReconnectionDelayMax(5000)
          .setAuth({'token': token, 'userId': userId, 'role': role})
          .build(),
    );

    _socket!
      ..onConnect((_) {
        _isConnected = true;
        if (_connectCompleter != null && !_connectCompleter!.isCompleted) {
          _connectCompleter!.complete();
        }
      })
      ..onDisconnect((_) {
        debugPrint("❌ [SOCKET] Disconnected");
        _isConnected = false;
      })
      ..onConnectError((e) {
        debugPrint("⚠️ [SOCKET] Connect error: $e");
        if (_connectCompleter != null && !_connectCompleter!.isCompleted) {
          _connectCompleter!.completeError(e);
        }
      })
      ..onError((e) {
        debugPrint("⚠️ [SOCKET] Error: $e");
      });

    _socket!.connect();

    // Lắng nghe TẤT CẢ sự kiện để debug
    _socket?.onAny((event, data) {
      debugPrint("📨 [SOCKET RECEIVE] Event: $event | Data: $data");
    });
  }

  Future<void> ensureConnected(String token, String userId, String role) async {
    if (_isConnected && _socket != null) {
      return;
    }

    connect(token, userId, role);
    await _connectCompleter?.future;
  }

  void disconnect() {
    _connectCompleter = null;
    _isConnected = false;
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
  }

  void emit(String event, [dynamic data]) {
    _socket?.emit(event, data);
  }

  // SỬA: Thêm cơ chế tự động kết nối nếu quên gọi connect trước đó
  void on(String event, void Function(dynamic) handler) {
    if (_socket == null) {
      debugPrint("❌ LỖI: Bạn đang gọi .on('$event') khi Socket là NULL!");
    }
    _socket?.on(event, handler);
  }

  void off(String event) {
    _socket?.off(event);
  }
}