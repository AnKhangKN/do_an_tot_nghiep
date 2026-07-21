import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../core/constants/color_constants.dart';
import '../../../../shared/widgtes/phone_call_widget.dart';
import '../../models/conversation_model.dart';
import '../providers/chat_provider.dart';
import '../widgets/message_bubble_widget.dart';

class MessengerScreen extends StatefulWidget {
  final ConversationModel conversation;

  const MessengerScreen({
    super.key,
    required this.conversation,
  });

  @override
  State<MessengerScreen> createState() => _MessengerScreenState();
}

class _MessengerScreenState extends State<MessengerScreen> {
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  String? _resolvedConversationId;

  String get _conversationKey => _resolvedConversationId ?? widget.conversation.id;
  String? get _partnerId => widget.conversation.partnerId;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      if (!mounted) return;

      final provider = context.read<ChatProvider>();

      if (_partnerId != null && _partnerId!.isNotEmpty) {
        final resolved = await provider.getOrCreateConversation(
          id: widget.conversation.id,
          name: widget.conversation.name,
          partnerId: _partnerId,
          phone: widget.conversation.phone,
          isEmergency: widget.conversation.isEmergency,
        );
        _resolvedConversationId = resolved.id;
      } else {
        _resolvedConversationId = widget.conversation.id;
      }

      if (!mounted) return;
      provider.markAsRead(_conversationKey);
      provider.loadMessages(_conversationKey);
      setState(() {});
    });
  }

  @override
  void dispose() {
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _sendMessage([String? quickText]) {
    final text = quickText ?? _textController.text.trim();
    if (text.isEmpty) return;

    context.read<ChatProvider>().sendMessage(_conversationKey, text, partnerId: _partnerId);

    if (quickText == null) {
      _textController.clear();
    }

    // Cuộn xuống tin nhắn mới nhất
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final chatProvider = context.watch<ChatProvider>();
    final messages = chatProvider.getMessages(_conversationKey);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 1,
        titleSpacing: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Color(0xFF1E293B), size: 20),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Row(
          children: [
            Stack(
              children: [
                CircleAvatar(
                  radius: 20,
                  backgroundColor: widget.conversation.isEmergency
                      ? ColorConstants.redRescue.withValues(alpha: 0.1)
                      : const Color(0xFFE2E8F0),
                  child: Icon(
                    widget.conversation.isEmergency
                        ? Icons.admin_panel_settings_rounded
                        : Icons.person_rounded,
                    color: widget.conversation.isEmergency
                        ? ColorConstants.redRescue
                        : const Color(0xFF64748B),
                    size: 22,
                  ),
                ),
                if (widget.conversation.isOnline)
                  Positioned(
                    right: 0,
                    bottom: 0,
                    child: Container(
                      width: 10,
                      height: 10,
                      decoration: BoxDecoration(
                        color: ColorConstants.success,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 1.5),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.conversation.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF0F172A),
                    ),
                  ),
                  Text(
                    widget.conversation.isOnline ? 'Đang hoạt động' : 'Ngoại tuyến',
                    style: TextStyle(
                      fontSize: 11,
                      color: widget.conversation.isOnline ? Colors.green : Colors.grey,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          if (widget.conversation.phone != null && widget.conversation.phone!.isNotEmpty)
            PhoneCallWidget(
              phoneNumber: widget.conversation.phone!,
              color: Colors.green,
              size: 24,
            ),
          const SizedBox(width: 8),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // List tin nhắn
            Expanded(
              child: ListView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.symmetric(vertical: 12),
                itemCount: messages.length,
                itemBuilder: (context, index) {
                  return MessageBubbleWidget(message: messages[index]);
                },
              ),
            ),

            // Gợi ý tin nhắn nhanh
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              child: Row(
                children: [
                  _buildQuickChip('📍 Chia sẻ vị trí hiện tại'),
                  _buildQuickChip('🚨 Tôi cần hỗ trợ gấp'),
                  _buildQuickChip('🚗 Đang di chuyển đến nơi'),
                  _buildQuickChip('✅ Đã an toàn'),
                ],
              ),
            ),

            // Ô nhập liệu
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: const BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black12,
                    blurRadius: 6,
                    offset: Offset(0, -2),
                  ),
                ],
              ),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.add_circle_outline_rounded, color: Color(0xFF64748B)),
                    onPressed: () {},
                    tooltip: 'Đính kèm',
                  ),
                  Expanded(
                    child: TextField(
                      controller: _textController,
                      textCapitalization: TextCapitalization.sentences,
                      decoration: InputDecoration(
                        hintText: 'Nhập tin nhắn...',
                        hintStyle: const TextStyle(fontSize: 14, color: Color(0xFF94A3B8)),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: BorderSide.none,
                        ),
                        filled: true,
                        fillColor: const Color(0xFFF1F5F9),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      ),
                      onSubmitted: (_) => _sendMessage(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Material(
                    color: ColorConstants.redRescue,
                    shape: const CircleBorder(),
                    child: IconButton(
                      icon: const Icon(Icons.send_rounded, color: Colors.white, size: 20),
                      onPressed: () => _sendMessage(),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickChip(String text) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ActionChip(
        label: Text(
          text,
          style: const TextStyle(fontSize: 12, color: Color(0xFF334155)),
        ),
        backgroundColor: Colors.white,
        side: const BorderSide(color: Color(0xFFCBD5E1)),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        onPressed: () => _sendMessage(text),
      ),
    );
  }
}
