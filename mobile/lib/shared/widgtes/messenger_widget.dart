import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:mobile/core/constants/router_constants.dart';
import 'package:mobile/features/chat/presentation/providers/chat_provider.dart';
import 'package:mobile/features/chat/presentation/screens/messenger_screen.dart';

class MessengerWidget extends StatelessWidget {
  final String? phoneNumber;
  final String? partnerId;
  final String? partnerName;
  final String? sosRequestId;
  final double size;
  final Color color;
  final VoidCallback? onTap;

  const MessengerWidget({
    super.key,
    this.phoneNumber,
    this.partnerId,
    this.partnerName,
    this.sosRequestId,
    this.size = 28.0,
    this.color = Colors.blue,
    this.onTap,
  });

  void _handleTap(BuildContext context) async {
    if (onTap != null) {
      onTap!();
      return;
    }

    if (partnerId != null && partnerId!.isNotEmpty) {
      try {
        final chatProvider = context.read<ChatProvider>();
        final conv = await chatProvider.getOrCreateConversation(
          id: partnerId!,
          partnerId: partnerId,
          name: partnerName ?? 'Đối tác cứu hộ',
          phone: phoneNumber,
          sosRequestId: sosRequestId,
        );
        if (context.mounted) {
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (context) => MessengerScreen(conversation: conv),
            ),
          );
        }
        return;
      } catch (e) {
        debugPrint('Error creating conversation in MessengerWidget: $e');
      }
    }

    try {
      context.push(RouterConstants.chat);
    } catch (e) {
      debugPrint('Error navigating to chat: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: Icon(Icons.chat_bubble_rounded, color: color, size: size),
      tooltip: 'Nhắn tin',
      onPressed: () => _handleTap(context),
    );
  }
}
