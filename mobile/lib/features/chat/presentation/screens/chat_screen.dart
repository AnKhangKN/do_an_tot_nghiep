import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../core/constants/color_constants.dart';
import '../../models/conversation_model.dart';
import '../providers/chat_provider.dart';
import '../widgets/chat_tile_widget.dart';
import 'messenger_screen.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  void _openMessengerDetail(ConversationModel conversation) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => MessengerScreen(conversation: conversation),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final chatProvider = context.watch<ChatProvider>();
    final chats = chatProvider.conversations;

    return Scaffold(
      backgroundColor: ColorConstants.backgroundLight,
      appBar: AppBar(
        backgroundColor: ColorConstants.surfaceWhite,
        elevation: 0,
        centerTitle: true,
        title: const Text(
          "TIN NHẮN HỖ TRỢ",
          style: TextStyle(
            color: ColorConstants.redRescue,
            fontWeight: FontWeight.w900,
            letterSpacing: 1.1,
          ),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Search Bar
            _buildSearchBar(),

            const SizedBox(height: 8),

            // Chat list
            Expanded(
              child: chats.isEmpty
                  ? const Center(
                      child: Text(
                        "Chưa có cuộc hội thoại nào",
                        style: TextStyle(color: Colors.grey),
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: chats.length,
                      itemBuilder: (context, index) {
                        final chat = chats[index];
                        return ChatTileWidget(
                          conversation: chat,
                          onTap: () => _openMessengerDetail(chat),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: ColorConstants.redRescue,
        onPressed: () {
          if (chats.isNotEmpty) {
            _openMessengerDetail(chats.first);
          }
        },
        icon: const Icon(Icons.emergency_share, color: Colors.white),
        label: const Text(
          "HỖ TRỢ KHẨN CẤP",
          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
        ),
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Container(
        decoration: BoxDecoration(
          color: ColorConstants.surfaceWhite,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: const TextField(
          decoration: InputDecoration(
            hintText: "Tìm kiếm cuộc hội thoại...",
            prefixIcon: Icon(Icons.search, color: ColorConstants.redRescue),
            border: InputBorder.none,
            contentPadding: EdgeInsets.symmetric(vertical: 15),
          ),
        ),
      ),
    );
  }
}
