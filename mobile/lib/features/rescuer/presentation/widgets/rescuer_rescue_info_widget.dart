import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile/features/chat/presentation/providers/chat_provider.dart';
import 'package:mobile/features/chat/presentation/screens/messenger_screen.dart';
import 'package:mobile/shared/widgtes/messenger_widget.dart';
import 'package:mobile/shared/widgtes/phone_call_widget.dart';

class RescuerRescueInfoWidget extends StatelessWidget {
  final Map<String, dynamic>? activeVictim;
  final String? sosRequestId;
  final String? description;
  final String? incidentTypeName;
  final double? distanceKm;   // Khoảng cách còn lại (km)
  final int? durationSec;     // Thời gian ước tính (giây)
  final VoidCallback onComplete;

  const RescuerRescueInfoWidget({
    super.key,
    required this.activeVictim,
    this.sosRequestId,
    this.description,
    this.incidentTypeName,
    this.distanceKm,
    this.durationSec,
    required this.onComplete,
  });

  /// Chuyển số giây thành chuỗi hiển thị phù hợp (ví dụ: "3 phút", "1 giờ 10 phút")
  String _formatDuration(int seconds) {
    if (seconds < 60) return "< 1 phút";
    final minutes = seconds ~/ 60;
    if (minutes < 60) return "$minutes phút";
    final hours = minutes ~/ 60;
    final remainMins = minutes % 60;
    return remainMins > 0 ? "$hours giờ $remainMins ph" : "$hours giờ";
  }

  @override
  Widget build(BuildContext context) {
    final victimName = activeVictim?['fullName'] ?? 'Không rõ';
    final victimPhone = activeVictim?['phone'];
    final displayIncidentType = incidentTypeName ?? activeVictim?['incidentTypeName'] ?? activeVictim?['serviceType'];
    final victimUserId = activeVictim?['userId'] ?? activeVictim?['user_id'] ?? activeVictim?['victimId'] ?? activeVictim?['victim_id'] ?? activeVictim?['id'];
    final resolvedSosId = sosRequestId ?? activeVictim?['sosRequestId'] ?? activeVictim?['sos_request_id'] ?? activeVictim?['sosId'] ?? activeVictim?['sos_id'];

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
              Icon(Icons.airport_shuttle, color: Colors.red, size: 22),
              SizedBox(width: 8),
              Text(
                "Đang đi cứu nạn...",
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                  color: Colors.red,
                ),
              ),
            ],
          ),

          // Thanh ETA + khoảng cách (hiện ra khi đã có dữ liệu OSRM)
          if (distanceKm != null || durationSec != null) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF3CD),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFD97706), width: 1),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (distanceKm != null) ...[
                    const Icon(Icons.route, size: 15, color: Color(0xFFD97706)),
                    const SizedBox(width: 4),
                    Text(
                      distanceKm! < 1
                          ? "${(distanceKm! * 1000).toStringAsFixed(0)} m"
                          : "${distanceKm!.toStringAsFixed(1)} km",
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFFD97706),
                      ),
                    ),
                  ],
                  if (distanceKm != null && durationSec != null)
                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 8),
                      child: Text("·", style: TextStyle(color: Color(0xFFD97706))),
                    ),
                  if (durationSec != null) ...[
                    const Icon(Icons.access_time, size: 15, color: Color(0xFFD97706)),
                    const SizedBox(width: 4),
                    Text(
                      "ETA: ${_formatDuration(durationSec!)}",
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFFD97706),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "Nạn nhân: $victimName",
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                        color: Color(0xFF1E293B),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      "SĐT: ${victimPhone ?? 'Không rõ'}",
                      style: const TextStyle(
                        fontSize: 13,
                        color: Color(0xFF64748B),
                      ),
                    ),
                  ],
                ),
              ),

              
              if (victimPhone != null && victimPhone.toString().isNotEmpty) ...[
                MessengerWidget(
                  phoneNumber: victimPhone.toString(),
                  partnerId: victimUserId?.toString(),
                  partnerName: '$victimName (Nạn nhân)',
                  sosRequestId: resolvedSosId?.toString(),
                  onTap: () async {
                    final chatProvider = context.read<ChatProvider>();
                    final conv = await chatProvider.getOrCreateConversation(
                      id: victimUserId?.toString() ?? 'victim_${victimPhone ?? victimName}',
                      partnerId: victimUserId?.toString(),
                      name: '$victimName (Nạn nhân)',
                      phone: victimPhone?.toString(),
                      sosRequestId: resolvedSosId?.toString(),
                    );
                    if (context.mounted) {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (context) => MessengerScreen(conversation: conv),
                        ),
                      );
                    }
                  },
                ),
                PhoneCallWidget(
                  phoneNumber: victimPhone.toString(),
                ),
              ],
            ],
          ),
          if (displayIncidentType != null && displayIncidentType.toString().isNotEmpty) ...[
            const SizedBox(height: 6),
            Row(
              children: [
                const Icon(Icons.build_circle_outlined, size: 16, color: Color(0xFFD97706)),
                const SizedBox(width: 4),
                Text(
                  "Loại sự cố: $displayIncidentType",
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFFD97706),
                  ),
                ),
              ],
            ),
          ],
          if (description != null && description!.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(
              "Mô tả sự cố: $description",
              style: const TextStyle(
                fontSize: 12,
                color: Colors.grey,
              ),
            ),
          ],
          const SizedBox(height: 14),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green,
              minimumSize: const Size.fromHeight(44),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              elevation: 0,
            ),
            onPressed: onComplete,
            child: const Text(
              "Hoàn thành cứu hộ",
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 15,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
