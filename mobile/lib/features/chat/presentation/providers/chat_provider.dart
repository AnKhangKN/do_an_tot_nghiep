import 'package:flutter/material.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:mobile/core/session/session_controller.dart';
import 'package:mobile/core/socket/modules/chat_socket.dart';
import 'package:mobile/core/storage/storage_service.dart';
import 'package:mobile/features/chat/data/chat_repository.dart';
import '../../models/chat_message_model.dart';
import '../../models/conversation_model.dart';

class ChatProvider extends ChangeNotifier {
  final ChatRepository? chatRepository;
  final ChatSocket? chatSocket;
  final SessionController? sessionController;
  final StorageService? storageService;

  List<ConversationModel> _conversations = [];

  final Map<String, List<ChatMessageModel>> _messagesMap = {};
  bool _isLoading = false;
  String _currentUserId = '';

  ChatProvider({
    this.chatRepository,
    this.chatSocket,
    this.sessionController,
    this.storageService,
  }) {
    resolveCurrentUserId();
    _initSocketListeners();
    fetchUserConversations();
  }

  bool get isLoading => _isLoading;
  List<ConversationModel> get conversations => List.unmodifiable(_conversations);

  Future<String> resolveCurrentUserId() async {
    if (_currentUserId.isNotEmpty) return _currentUserId;
    try {
      final token = await storageService?.getAccessToken();
      if (token != null && token.isNotEmpty) {
        final decoded = JwtDecoder.decode(token);
        final id = decoded['userId']?.toString() ?? decoded['sub']?.toString() ?? decoded['id']?.toString();
        if (id != null && id.isNotEmpty) {
          _currentUserId = id;
          return _currentUserId;
        }
      }
    } catch (_) {}
    return _currentUserId;
  }

  void _initSocketListeners() {
    chatSocket?.listenNewMessage((payload) async {
      await resolveCurrentUserId();

      final msgData = payload['message'];
      final convData = payload['conversation'];

      if (msgData != null) {
        final conversationId = msgData['conversation_id']?.toString() ?? convData?['conversation_id']?.toString();
        final senderId = msgData['sender_id']?.toString();
        final text = msgData['content']?.toString() ?? '';
        final msgId = msgData['message_id']?.toString() ?? DateTime.now().millisecondsSinceEpoch.toString();

        if (conversationId != null) {
          final isMe = senderId != null && senderId == _currentUserId;
          final newMsg = ChatMessageModel(
            id: msgId,
            senderId: senderId ?? '',
            text: text,
            time: '${TimeOfDay.now().hour}:${TimeOfDay.now().minute.toString().padLeft(2, '0')}',
            isMe: isMe,
          );

          if (_messagesMap.containsKey(conversationId)) {
            final list = _messagesMap[conversationId]!;
            final exists = list.any((m) => m.id == msgId || (m.isMe && isMe && m.text == text && (m.id.length > 10 || msgId.length > 10)));
            if (!exists) {
              list.add(newMsg);
            }
          } else {
            _messagesMap[conversationId] = [newMsg];
          }

          // Cập nhật danh sách cuộc hội thoại
          final index = _conversations.indexWhere((c) => c.id == conversationId);
          if (index != -1) {
            final old = _conversations[index];
            final updated = ConversationModel(
              id: old.id,
              name: old.name,
              lastMessage: text,
              time: 'Vừa xong',
              unreadCount: isMe ? old.unreadCount : old.unreadCount + 1,
              isEmergency: old.isEmergency,
              isOnline: old.isOnline,
              avatarUrl: old.avatarUrl,
              phone: old.phone,
            );
            _conversations.removeAt(index);
            _conversations.insert(0, updated);
          } else if (convData != null) {
            _conversations.insert(
              0,
              ConversationModel(
                id: conversationId,
                name: convData['user1_name'] ?? convData['user2_name'] ?? 'Đối tác cứu hộ',
                lastMessage: text,
                time: 'Vừa xong',
                unreadCount: isMe ? 0 : 1,
                isOnline: true,
              ),
            );
          }
          notifyListeners();
        }
      }
    });
  }

  Future<void> fetchUserConversations() async {
    if (chatRepository == null) return;
    _isLoading = true;
    notifyListeners();

    try {
      await resolveCurrentUserId();
      final remoteList = await chatRepository!.getUserConversations();
      _conversations = remoteList;
    } catch (e) {
      debugPrint('Error fetching conversations: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadMessages(String conversationId) async {
    chatSocket?.joinConversation(conversationId);
    await resolveCurrentUserId();

    if (chatRepository != null) {
      try {
        final remoteMessages = await chatRepository!.getMessages(
          conversationId,
          currentUserId: _currentUserId,
        );
        _messagesMap[conversationId] = remoteMessages;
        notifyListeners();
        return;
      } catch (e) {
        debugPrint('Error loading messages: $e');
      }
    }

    if (!_messagesMap.containsKey(conversationId)) {
      getMessages(conversationId);
    }
  }

  List<ChatMessageModel> getMessages(String conversationId) {
    if (!_messagesMap.containsKey(conversationId)) {
      _messagesMap[conversationId] = [];
    }
    return List.unmodifiable(_messagesMap[conversationId]!);
  }

  Future<void> sendMessage(String conversationId, String text, {String? partnerId}) async {
    final cleanText = text.trim();
    if (cleanText.isEmpty) return;

    await resolveCurrentUserId();

    final now = TimeOfDay.now();
    final timeStr = '${now.hour}:${now.minute.toString().padLeft(2, '0')}';
    final tempMsgId = DateTime.now().millisecondsSinceEpoch.toString();

    final newMessage = ChatMessageModel(
      id: tempMsgId,
      senderId: _currentUserId,
      text: cleanText,
      time: timeStr,
      isMe: true,
    );

    if (!_messagesMap.containsKey(conversationId)) {
      getMessages(conversationId);
    }
    _messagesMap[conversationId]!.add(newMessage);

    // Cập nhật cuộc hội thoại trong danh sách
    final index = _conversations.indexWhere((c) => c.id == conversationId);
    if (index != -1) {
      final old = _conversations[index];
      final updated = ConversationModel(
        id: old.id,
        name: old.name,
        lastMessage: cleanText,
        time: timeStr,
        unreadCount: 0,
        isEmergency: old.isEmergency,
        isOnline: old.isOnline,
        avatarUrl: old.avatarUrl,
        phone: old.phone,
      );
      _conversations.removeAt(index);
      _conversations.insert(0, updated);
    }

    notifyListeners();

    // Gửi tin nhắn qua Socket.IO thuần túy (Socket sẽ gọi ChatService lưu DB và broadcast)
    final convIndex = _conversations.indexWhere((c) => c.id == conversationId);
    final resolvedPartnerId = partnerId ?? (convIndex != -1 ? _conversations[convIndex].partnerId : null);
    chatSocket?.sendSocketMessage(conversationId, cleanText, partnerId: resolvedPartnerId);
  }

  void markAsRead(String conversationId) {
    final index = _conversations.indexWhere((c) => c.id == conversationId);
    if (index != -1 && _conversations[index].unreadCount > 0) {
      final old = _conversations[index];
      _conversations[index] = ConversationModel(
        id: old.id,
        name: old.name,
        lastMessage: old.lastMessage,
        time: old.time,
        unreadCount: 0,
        isEmergency: old.isEmergency,
        isOnline: old.isOnline,
        avatarUrl: old.avatarUrl,
        phone: old.phone,
        partnerId: old.partnerId,
      );
      notifyListeners();
    }
  }

  Future<ConversationModel> getOrCreateConversation({
    required String id,
    required String name,
    String? partnerId,
    String? phone,
    bool isEmergency = false,
    String? sosRequestId,
  }) async {
    if (chatRepository != null && partnerId != null && partnerId.isNotEmpty) {
      final remoteConv = await chatRepository!.getOrCreateConversation(partnerId, sosRequestId: sosRequestId);
      if (remoteConv != null) {
        final existingIdx = _conversations.indexWhere((c) => c.id == remoteConv.id || (c.partnerId != null && c.partnerId == partnerId));
        if (existingIdx != -1) {
          _conversations[existingIdx] = remoteConv;
        } else {
          _conversations.insert(0, remoteConv);
        }
        notifyListeners();
        return remoteConv;
      }
    }

    final existingIndex = _conversations.indexWhere((c) => c.id == id || (partnerId != null && (c.id == partnerId || c.partnerId == partnerId)));
    if (existingIndex != -1) {
      return _conversations[existingIndex];
    }

    final newConv = ConversationModel(
      id: id,
      name: name,
      lastMessage: "Bắt đầu cuộc trò chuyện...",
      time: "Vừa xong",
      isOnline: true,
      phone: phone,
      isEmergency: isEmergency,
      partnerId: partnerId,
    );
    _conversations.insert(0, newConv);
    notifyListeners();
    return newConv;
  }
}
