import 'package:mobile/features/chat/data/chat_service.dart';
import 'package:mobile/features/chat/models/chat_message_model.dart';
import 'package:mobile/features/chat/models/conversation_model.dart';

class ChatRepository {
  final ChatService service;

  ChatRepository(this.service);

  Future<ConversationModel?> getOrCreateConversation(String partnerId, {String? sosRequestId}) async {
    try {
      final response = await service.getOrCreateConversation(partnerId, sosRequestId: sosRequestId);
      final data = response.data['data'];
      if (data != null) {
        return _mapConversation(data);
      }
    } catch (e) {
      // Return null on exception
    }
    return null;
  }

  Future<ConversationModel?> getOrCreateAdminSupportConversation() async {
    try {
      final response = await service.getOrCreateAdminSupportConversation();
      final data = response.data['data'];
      if (data != null) {
        return _mapConversation(data);
      }
    } catch (e) {
      // Fallback
    }
    return null;
  }

  Future<List<ConversationModel>> getUserConversations() async {
    try {
      final response = await service.getUserConversations();
      final List list = response.data['data'] ?? [];
      return list.map((item) => _mapConversation(item)).toList();
    } catch (e) {
      return [];
    }
  }

  Future<List<ChatMessageModel>> getMessages(String conversationId, {required String currentUserId}) async {
    try {
      final response = await service.getMessages(conversationId);
      final List list = response.data['data'] ?? [];
      return list.map((item) {
        final senderId = item['sender_id'] ?? item['senderId'];
        return ChatMessageModel(
          id: item['message_id']?.toString() ?? '',
          senderId: senderId?.toString() ?? '',
          text: item['content']?.toString() ?? '',
          time: _formatTime(item['created_at']),
          isMe: senderId?.toString() == currentUserId,
          isEmergency: item['message_type'] == 'EMERGENCY',
        );
      }).toList();
    } catch (e) {
      return [];
    }
  }

  Future<ChatMessageModel?> sendMessage(String conversationId, String content, {required String currentUserId}) async {
    try {
      final response = await service.sendMessage(conversationId, content);
      final item = response.data['data'];
      if (item != null) {
        return ChatMessageModel(
          id: item['message_id']?.toString() ?? DateTime.now().millisecondsSinceEpoch.toString(),
          senderId: currentUserId,
          text: content,
          time: _formatTime(item['created_at']),
          isMe: true,
        );
      }
    } catch (e) {
      // Fallback
    }
    return null;
  }

  ConversationModel _mapConversation(Map<String, dynamic> item) {
    final lastAt = item['last_message_at'] ?? item['updated_at'];
    final bool isClosed = item['is_closed'] == true || item['isClosed'] == true;
    return ConversationModel(
      id: item['conversation_id']?.toString() ?? '',
      name: item['partner_name']?.toString() ?? 'Đối tác cứu hộ',
      lastMessage: item['last_message']?.toString() ?? 'Bắt đầu cuộc trò chuyện...',
      time: _formatTime(lastAt),
      unreadCount: int.tryParse(item['unread_count']?.toString() ?? '0') ?? 0,
      isOnline: true,
      phone: item['partner_phone']?.toString(),
      avatarUrl: item['partner_avatar']?.toString(),
      isClosed: isClosed,
      sosStatus: item['sos_status']?.toString(),
      sosRequestId: item['sos_request_id']?.toString() ?? item['sosRequestId']?.toString(),
    );
  }

  String _formatTime(dynamic dateStr) {
    if (dateStr == null) return 'Vừa xong';
    try {
      final date = DateTime.parse(dateStr.toString()).toLocal();
      return '${date.hour}:${date.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return 'Vừa xong';
    }
  }
}
