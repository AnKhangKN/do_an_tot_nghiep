import 'package:flutter/material.dart';
import '../../../../core/constants/color_constants.dart';
import '../../models/chat_message_model.dart';

class MessageBubbleWidget extends StatelessWidget {
  final ChatMessageModel message;

  const MessageBubbleWidget({
    super.key,
    required this.message,
  });

  void _showErrorReason(BuildContext context, String reason) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Row(
          children: [
            Icon(Icons.warning_amber_rounded, color: Colors.red),
            SizedBox(width: 8),
            Text(
              "Tin nhắn bị từ chối",
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
            ),
          ],
        ),
        content: Text(
          reason,
          style: const TextStyle(fontSize: 14, color: Color(0xFF475569), height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text("Đóng", style: TextStyle(fontWeight: FontWeight.bold, color: Colors.red)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isMe = message.isMe;

    final bubble = Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      constraints: BoxConstraints(
        maxWidth: MediaQuery.of(context).size.width * 0.75,
      ),
      decoration: BoxDecoration(
        color: message.isFailed
            ? const Color(0xFFFEF2F2)
            : (isMe
                ? ColorConstants.redRescue
                : (message.isEmergency
                    ? const Color(0xFFFEF2F2)
                    : Colors.white)),
        borderRadius: BorderRadius.only(
          topLeft: const Radius.circular(16),
          topRight: const Radius.circular(16),
          bottomLeft: Radius.circular(isMe ? 16 : 4),
          bottomRight: Radius.circular(isMe ? 4 : 16),
        ),
        border: message.isFailed
            ? Border.all(color: Colors.red.shade300)
            : (!isMe && message.isEmergency
                ? Border.all(color: Colors.red.shade200)
                : (isMe ? null : Border.all(color: const Color(0xFFE2E8F0)))),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment:
            isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        children: [
          Text(
            message.text,
            style: TextStyle(
              fontSize: 14,
              color: message.isFailed
                  ? Colors.red.shade900
                  : (isMe
                      ? Colors.white
                      : (message.isEmergency
                          ? const Color(0xFF991B1B)
                          : const Color(0xFF1E293B))),
              height: 1.35,
              decoration: message.isFailed ? TextDecoration.lineThrough : null,
            ),
          ),
          const SizedBox(height: 4),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (message.isFailed)
                const Padding(
                  padding: EdgeInsets.only(right: 4),
                  child: Text(
                    "Gửi thất bại",
                    style: TextStyle(fontSize: 10, color: Colors.red, fontWeight: FontWeight.w600),
                  ),
                ),
              Text(
                message.time,
                style: TextStyle(
                  fontSize: 10,
                  color: message.isFailed
                      ? Colors.red.shade400
                      : (isMe
                          ? Colors.white70
                          : const Color(0xFF94A3B8)),
                ),
              ),
            ],
          ),
        ],
      ),
    );

    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 12),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            if (isMe && message.isFailed)
              GestureDetector(
                onTap: () => _showErrorReason(
                  context,
                  message.errorMessage ?? "Nội dung tin nhắn không hợp lệ hoặc bị hệ thống từ chối.",
                ),
                child: Container(
                  margin: const EdgeInsets.only(right: 6),
                  padding: const EdgeInsets.all(4),
                  decoration: const BoxDecoration(
                    color: Color(0xFFFEE2E2),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.priority_high_rounded,
                    color: Colors.red,
                    size: 18,
                  ),
                ),
              ),
            Flexible(child: bubble),
            if (!isMe && message.isFailed)
              GestureDetector(
                onTap: () => _showErrorReason(
                  context,
                  message.errorMessage ?? "Nội dung tin nhắn không hợp lệ hoặc bị hệ thống từ chối.",
                ),
                child: Container(
                  margin: const EdgeInsets.only(left: 6),
                  padding: const EdgeInsets.all(4),
                  decoration: const BoxDecoration(
                    color: Color(0xFFFEE2E2),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.priority_high_rounded,
                    color: Colors.red,
                    size: 18,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
