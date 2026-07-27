import 'dart:async';
import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../constants/app_constants.dart';
import '../di/di.dart';
import '../../features/auth/data/auth_repository.dart';

class CoreSocket {
  // Biến thành Singleton để đảm bảo dùng chung 1 instance trong toàn app
  static final CoreSocket _instance = CoreSocket._internal();
  factory CoreSocket() => _instance;
  CoreSocket._internal();

  IO.Socket? _socket;
  bool _isConnected = false;
  bool get isConnected => _isConnected;

  String? _currentToken;
  String? _currentUserId;
  String? _currentRole;

  Completer<void>? _connectCompleter;

  void connect(String token, String userId, String role, {bool force = false}) {
    // Nếu socket đang hoạt động với ĐÚNG token này và không ép buộc reconnect thì giữ nguyên
    if (!force && _socket != null && _socket!.connected && _currentToken == token) {
      debugPrint("⚠️ Socket đã tồn tại và đang hoạt động với token hợp lệ.");
      return;
    }

    _currentToken = token;
    _currentUserId = userId;
    _currentRole = role;

    if (_socket != null) {
      try {
        _socket!.clearListeners();
        _socket!.disconnect();
        _socket!.dispose();
      } catch (_) {}
      _socket = null;
    }

    _connectCompleter = Completer<void>();

    _socket = IO.io(
      AppConstants.baseUrl,
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .enableReconnection()
          .setReconnectionAttempts(999999)
          .setReconnectionDelay(1000)
          .setReconnectionDelayMax(3000)
          .setAuth({'token': token, 'userId': userId, 'role': role})
          .build(),
    );

    _socket!
      ..onConnect((_) {
        debugPrint("🟢 [SOCKET] Connected thành công (User: $userId, Role: $role)");
        _isConnected = true;
        if (_connectCompleter != null && !_connectCompleter!.isCompleted) {
          _connectCompleter!.complete();
        }
      })
      ..onDisconnect((reason) {
        debugPrint("❌ [SOCKET] Disconnected. Lý do: $reason");
        _isConnected = false;
      })
      ..onConnectError((e) async {
        debugPrint("⚠️ [SOCKET] Connect error: $e");
        _isConnected = false;
        if (_connectCompleter != null && !_connectCompleter!.isCompleted) {
          _connectCompleter!.completeError(e);
        }

        // Tự động làm mới token nếu phát hiện lỗi JWT hết hạn
        final errStr = e.toString().toLowerCase();
        if (errStr.contains('jwt expired') || errStr.contains('token expired')) {
          debugPrint("🔄 [SOCKET] JWT Token đã hết hạn. Đang tự động lấy Access Token mới...");
          try {
            final newToken = await getIt<AuthRepository>().getValidAccessToken();
            if (newToken != null && newToken != token) {
              debugPrint("🟢 [SOCKET] Lấy Access Token mới thành công! Đang tự động kết nối lại Socket...");
              connect(newToken, userId, role, force: true);
            }
          } catch (err) {
            debugPrint("❌ [SOCKET] Lỗi tự động lấy token mới: $err");
          }
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
    if (_isConnected && _socket != null && _currentToken == token) {
      return;
    }

    connect(token, userId, role, force: true);
    await _connectCompleter?.future;
  }

  void disconnect() {
    _connectCompleter = null;
    _isConnected = false;
    _currentToken = null;
    _currentUserId = null;
    _currentRole = null;
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