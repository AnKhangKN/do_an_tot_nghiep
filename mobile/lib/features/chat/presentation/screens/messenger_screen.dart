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

    final matchingConv = chatProvider.conversations.firstWhere(
      (c) => c.id == _conversationKey || c.id == widget.conversation.id,
      orElse: () => widget.conversation,
    );
    final String? sosStatus = matchingConv.sosStatus ?? widget.conversation.sosStatus;
    final bool isClosed = widget.conversation.isClosed || matchingConv.isClosed;
    final bool isGracePeriod = !isClosed && (sosStatus == 'DONE' || sosStatus == 'COMPLETED' || sosStatus == 'CANCELLED');

    return Scaffold(
      backgroundColor: ColorConstants.surfaceWhite,
      appBar: AppBar(
        backgroundColor: ColorConstants.surfaceWhite,
        elevation: 1,
        titleSpacing: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded, color: ColorConstants.textPrimary, size: 20),
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
                      : ColorConstants.bgCanvas,
                  child: Icon(
                    widget.conversation.isEmergency
                        ? Icons.admin_panel_settings_rounded
                        : Icons.person_rounded,
                    color: widget.conversation.isEmergency
                        ? ColorConstants.redRescue
                        : ColorConstants.textSecondary,
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
                  Row(
                    children: [
                      Flexible(
                        child: Text(
                          widget.conversation.name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            color: ColorConstants.textPrimary,
                          ),
                        ),
                      ),
                      if (isClosed) ...[
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: ColorConstants.bgCanvas,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            'Đã đóng',
                            style: TextStyle(fontSize: 10, color: ColorConstants.textSecondary, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ] else if (isGracePeriod) ...[
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.blue[50],
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text(
                            'Gia hạn 15p',
                            style: TextStyle(fontSize: 10, color: Colors.blue, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ],
                  ),
                  Text(
                    isClosed
                        ? 'Kênh trò chuyện đã khóa'
                        : isGracePeriod
                            ? 'Thời gian gia hạn 15 phút'
                            : (widget.conversation.isOnline ? 'Đang hoạt động' : 'Ngoại tuyến'),
                    style: TextStyle(
                      fontSize: 11,
                      color: isClosed ? Colors.orange[800] : (isGracePeriod ? Colors.blue[700] : (widget.conversation.isOnline ? Colors.green : ColorConstants.textSecondary)),
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

            // Banner thông báo kênh chat đã đóng hoặc gia hạn 15 phút
            if (isClosed)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                color: const Color(0xFFFEF3C7),
                child: const Row(
                  children: [
                    Icon(Icons.lock_rounded, color: Color(0xFFD97706), size: 18),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Kênh chat này đã tự động đóng do ca cứu hộ đã hoàn thành hoặc bị hủy.',
                        style: TextStyle(fontSize: 12, color: Color(0xFF92400E), fontWeight: FontWeight.w500),
                      ),
                    ),
                  ],
                ),
              )
            else if (isGracePeriod)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                color: const Color(0xFFE0F2FE),
                child: const Row(
                  children: [
                    Icon(Icons.timer_outlined, color: Color(0xFF0284C7), size: 18),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Ca cứu hộ đã kết thúc. Kênh trò chuyện đang trong thời gian gia hạn 15 phút để hỗ trợ phát sinh.',
                        style: TextStyle(fontSize: 12, color: Color(0xFF0369A1), fontWeight: FontWeight.w500),
                      ),
                    ),
                  ],
                ),
              ),

            // Gợi ý tin nhắn nhanh (chỉ hiển thị khi kênh còn mở)
            if (!isClosed)
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
              decoration: BoxDecoration(
                color: ColorConstants.surfaceWhite,
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
                    icon: Icon(Icons.add_circle_outline_rounded, color: isClosed ? ColorConstants.textMuted : ColorConstants.textSecondary),
                    onPressed: isClosed ? null : () {},
                    tooltip: 'Đính kèm',
                  ),
                  Expanded(
                    child: TextField(
                      controller: _textController,
                      enabled: !isClosed,
                      textCapitalization: TextCapitalization.sentences,
                      decoration: InputDecoration(
                        hintText: isClosed ? 'Kênh trò chuyện đã bị khóa...' : 'Nhập tin nhắn...',
                        hintStyle: TextStyle(fontSize: 14, color: ColorConstants.textMuted),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: BorderSide.none,
                        ),
                        filled: true,
                        fillColor: ColorConstants.bgCanvas,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      ),
                      onSubmitted: isClosed ? null : (_) => _sendMessage(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Material(
                    color: isClosed ? ColorConstants.textMuted : ColorConstants.redRescue,
                    shape: const CircleBorder(),
                    child: IconButton(
                      icon: const Icon(Icons.send_rounded, color: Colors.white, size: 20),
                      onPressed: isClosed ? null : () => _sendMessage(),
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
          style: TextStyle(fontSize: 12, color: ColorConstants.textPrimary),
        ),
        backgroundColor: ColorConstants.surfaceWhite,
        side: BorderSide(color: ColorConstants.borderDark),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        onPressed: () => _sendMessage(text),
      ),
    );
  }
}
