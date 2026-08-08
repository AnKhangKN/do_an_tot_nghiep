import 'package:mobile/core/socket/core_socket.dart';

class ChatSocket {
  final CoreSocket coreSocket;
  final Set<String> _joinedConversationIds = <String>{};
  bool _rejoinHookRegistered = false;

  ChatSocket(this.coreSocket);

  void _registerRejoinHook() {
    if (_rejoinHookRegistered) return;
    _rejoinHookRegistered = true;

    coreSocket.addOnConnectedHook(() {
      for (final conversationId in _joinedConversationIds) {
        coreSocket.emit('chat:join', {'conversationId': conversationId});
      }
    });
  }

  void joinConversation(String conversationId) {
    if (conversationId.isEmpty) return;

    _registerRejoinHook();
    _joinedConversationIds.add(conversationId);

    if (coreSocket.isConnected) {
      coreSocket.emit('chat:join', {'conversationId': conversationId});
    }
  }

  void listenNewMessage(Function(Map<String, dynamic> payload) onNewMessage) {
    coreSocket.off('chat:new_message');
    coreSocket.on('chat:new_message', (data) {
      if (data != null && data is Map) {
        onNewMessage(Map<String, dynamic>.from(data));
      }
    });
  }

  void listenChatError(Function(Map<String, dynamic> payload) onError) {
    coreSocket.off('chat:error');
    coreSocket.on('chat:error', (data) {
      if (data != null && data is Map) {
        onError(Map<String, dynamic>.from(data));
      }
    });
  }

  void listenConversationClosed(Function(Map<String, dynamic> payload) onClosed) {
    coreSocket.off('chat:conversation_closed');
    coreSocket.on('chat:conversation_closed', (data) {
      if (data != null && data is Map) {
        onClosed(Map<String, dynamic>.from(data));
      }
    });
  }

  void sendSocketMessage(String conversationId, String content, {String? partnerId, String? tempId}) {
    if (conversationId.isNotEmpty || (partnerId != null && partnerId.isNotEmpty)) {
      coreSocket.emit('chat:send_message', {
        'conversationId': conversationId,
        'partnerId': partnerId,
        'content': content,
        'tempId': tempId,
      });
    }
  }

  void dispose() {
    coreSocket.off('chat:new_message');
    coreSocket.off('chat:error');
    coreSocket.off('chat:conversation_closed');
    _joinedConversationIds.clear();
  }

  /// Re-register các listener chat mỗi lần socket kết nối/reconnect để không bị
  /// mất khi CoreSocket.connect() tạo socket mới (clearListeners).
  void addOnConnectedHook(void Function() cb) {
    coreSocket.addOnConnectedHook(cb);
  }
}
