import 'package:dio/dio.dart';

class ChatService {
  final Dio dio;

  ChatService(this.dio);

  Future<Response> getOrCreateConversation(String partnerId, {String? sosRequestId}) async {
    return await dio.post('/api/chat/conversations', data: {
      'partnerId': partnerId,
      if (sosRequestId != null) 'sosRequestId': sosRequestId,
    });
  }

  Future<Response> getOrCreateAdminSupportConversation() async {
    return await dio.post('/api/chat/conversations/admin-support');
  }

  Future<Response> getUserConversations() async {
    return await dio.get('/api/chat/conversations');
  }

  Future<Response> getMessages(String conversationId, {int limit = 50, int offset = 0}) async {
    return await dio.get('/api/chat/conversations/$conversationId/messages', queryParameters: {
      'limit': limit,
      'offset': offset,
    });
  }

  Future<Response> sendMessage(String conversationId, String content, {String messageType = 'TEXT'}) async {
    return await dio.post('/api/chat/messages', data: {
      'conversationId': conversationId,
      'content': content,
      'messageType': messageType,
    });
  }
}
