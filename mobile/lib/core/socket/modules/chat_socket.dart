import 'package:mobile/core/socket/core_socket.dart';

class ChatSocket {
  final CoreSocket coreSocket;

  ChatSocket(this.coreSocket);

  void joinConversation(String conversationId) {
    if (conversationId.isNotEmpty) {
      coreSocket.emit('chat:join', {'conversationId': conversationId});
    }
  }

  void listenNewMessage(Function(Map<String, dynamic> payload) onNewMessage) {
    coreSocket.on('chat:new_message', (data) {
      if (data != null && data is Map) {
        onNewMessage(Map<String, dynamic>.from(data));
      }
    });
  }

  void sendSocketMessage(String conversationId, String content, {String? partnerId}) {
    if (conversationId.isNotEmpty || (partnerId != null && partnerId.isNotEmpty)) {
      coreSocket.emit('chat:send_message', {
        'conversationId': conversationId,
        'partnerId': partnerId,
        'content': content,
      });
    }
  }

  void dispose() {
    coreSocket.off('chat:new_message');
  }
}
