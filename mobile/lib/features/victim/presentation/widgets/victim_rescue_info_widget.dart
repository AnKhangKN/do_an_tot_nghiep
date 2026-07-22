import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile/core/di/di.dart';
import 'package:mobile/core/session/app_session.dart';
import 'package:mobile/features/chat/presentation/providers/chat_provider.dart';
import 'package:mobile/features/chat/presentation/screens/messenger_screen.dart';
import 'package:mobile/shared/widgtes/messenger_widget.dart';
import 'package:mobile/shared/widgtes/phone_call_widget.dart';

class VictimRescueInfoWidget extends StatelessWidget {
  final Map<String, dynamic>? activeRescuer;

  const VictimRescueInfoWidget({
    super.key,
    required this.activeRescuer,
  });

  @override
  Widget build(BuildContext context) {
    final name = activeRescuer?['fullName'] ?? 'Không rõ';
    final phone = activeRescuer?['phone'];
    final rescuerUserId = activeRescuer?['userId'] ?? activeRescuer?['user_id'] ?? activeRescuer?['rescuerId'] ?? activeRescuer?['rescuer_id'] ?? activeRescuer?['id'];
    final sosRequestId = activeRescuer?['sosRequestId'] ?? activeRescuer?['sos_request_id'] ?? activeRescuer?['sosId'] ?? activeRescuer?['sos_id'];

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: const [
          BoxShadow(
            color: Colors.black12,
            blurRadius: 10,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.check_circle, color: Colors.green, size: 22),
              SizedBox(width: 8),
              Text(
                "Người cứu hộ đang đến!",
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                  color: Colors.green,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "Họ tên: $name",
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                        color: Color(0xFF1E293B),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      "SĐT: ${phone ?? 'Không rõ'}",
                      style: const TextStyle(
                        fontSize: 13,
                        color: Color(0xFF64748B),
                      ),
                    ),
                  ],
                ),
              ),


              if (phone != null && phone.toString().isNotEmpty) ...[
                MessengerWidget(
                  phoneNumber: phone.toString(),
                  partnerId: rescuerUserId?.toString(),
                  partnerName: '$name (Cứu hộ viên)',
                  sosRequestId: sosRequestId?.toString(),
                  onTap: () async {
                    final chatProvider = context.read<ChatProvider>();
                    final conv = await chatProvider.getOrCreateConversation(
                      id: rescuerUserId?.toString() ?? 'rescuer_${phone ?? name}',
                      partnerId: rescuerUserId?.toString(),
                      name: '$name (Cứu hộ viên)',
                      phone: phone?.toString(),
                      sosRequestId: sosRequestId?.toString(),
                    );
                    if (context.mounted) {
                      await Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (context) => MessengerScreen(conversation: conv),
                        ),
                      );
                      // Tự động đồng bộ lại trạng thái khi quay về màn hình bản đồ
                      getIt<AppSession>().checkAndRestoreActiveRescue();
                    }
                  },
                ),
                PhoneCallWidget(
                  phoneNumber: phone.toString(),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}
