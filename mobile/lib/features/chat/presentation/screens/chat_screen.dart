import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../core/constants/color_constants.dart';
import '../../../../shared/widgtes/emergency_dialog_widget.dart';
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

  void _showEmergencyOptionsBottomSheet(List<ConversationModel> chats) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (modalContext) {
        return Container(
          decoration: const BoxDecoration(
            color: ColorConstants.surfaceWhite,
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(28),
              topRight: Radius.circular(28),
            ),
          ),
          child: SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.grey[300],
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    "LỰA CHỌN HỖ TRỢ KHẨN CẤP",
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: ColorConstants.redRescue,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    "Vui lòng chọn hình thức hỗ trợ phù hợp",
                    style: TextStyle(
                      fontSize: 13,
                      color: ColorConstants.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 20),
                  // Option 1: Cuộc gọi khẩn cấp (115, 114, 113, 112...)
                  _buildOptionItem(
                    icon: Icons.phone_in_talk_rounded,
                    iconBgColor: ColorConstants.redRescue.withValues(alpha: 0.1),
                    iconColor: ColorConstants.redRescue,
                    title: "Cuộc gọi khẩn cấp (115, 114, 113, 112)",
                    subtitle: "Gọi điện trực tiếp tới các đầu số cứu hộ Quốc gia",
                    onTap: () {
                      Navigator.pop(modalContext);
                      EmergencyDialogWidget.show(context);
                    },
                  ),
                  const SizedBox(height: 12),
                  // Option 2: Liên hệ Admin / Trợ giúp viên
                  _buildOptionItem(
                    icon: Icons.admin_panel_settings_rounded,
                    iconBgColor: Colors.blue.withValues(alpha: 0.1),
                    iconColor: Colors.blue,
                    title: "Liên hệ Admin / Trợ giúp viên",
                    subtitle: "Nhắn tin trao đổi trực tiếp với Ban Quản trị",
                    onTap: () async {
                      Navigator.pop(modalContext);

                      final chatProvider = context.read<ChatProvider>();
                      final adminChat = await chatProvider.getOrCreateAdminSupportConversation();
                      if (mounted) {
                        _openMessengerDetail(adminChat);
                      }
                    },
                  ),
                  const SizedBox(height: 12),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildOptionItem({
    required IconData icon,
    required Color iconBgColor,
    required Color iconColor,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: ColorConstants.backgroundLight,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: ColorConstants.border.withValues(alpha: 0.5),
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: iconBgColor,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: iconColor, size: 24),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                      color: ColorConstants.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontSize: 12,
                      color: ColorConstants.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(
              Icons.chevron_right_rounded,
              color: ColorConstants.textSecondary,
            ),
          ],
        ),
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
        onPressed: () => _showEmergencyOptionsBottomSheet(chats),
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

