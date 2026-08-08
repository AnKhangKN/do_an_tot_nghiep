import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile/core/constants/color_constants.dart';
import 'package:mobile/core/network/direction_service.dart';
import 'package:mobile/features/chat/presentation/providers/chat_provider.dart';
import 'package:mobile/features/chat/presentation/screens/messenger_screen.dart';
import 'package:mobile/shared/widgtes/messenger_widget.dart';
import 'package:mobile/shared/widgtes/phone_call_widget.dart';
import 'package:mobile/shared/widgtes/rescue_completion_dialog_widget.dart';
import 'package:mobile/shared/widgtes/emergency_dialog_widget.dart';
import 'package:mobile/shared/widgtes/rescue_cancel_reason_dialog.dart';

class RescuerRescueInfoWidget extends StatelessWidget {
  final Map<String, dynamic>? activeVictim;
  final String? sosRequestId;
  final String? description;
  final String? incidentTypeName;
  final double? distanceKm;   // Khoảng cách còn lại (km)
  final int? durationSec;     // Thời gian ước tính (giây)
  final VoidCallback onComplete;
  final void Function(String reason)? onCancel;

  const RescuerRescueInfoWidget({
    super.key,
    required this.activeVictim,
    this.sosRequestId,
    this.description,
    this.incidentTypeName,
    this.distanceKm,
    this.durationSec,
    required this.onComplete,
    this.onCancel,
  });

  Future<void> _onCancelPressed(BuildContext context) async {
    final reason = await RescueCancelReasonDialog.show(context);
    if (reason != null && reason.isNotEmpty) {
      onCancel?.call(reason);
    }
  }

  void _showFullImageModal(BuildContext context, String url) {
    showDialog(
      context: context,
      useRootNavigator: true,
      builder: (ctx) => Dialog.fullscreen(
        backgroundColor: Colors.black,
        child: Stack(
          children: [
            Center(
              child: InteractiveViewer(
                minScale: 0.5,
                maxScale: 4.0,
                child: Image.network(
                  url,
                  fit: BoxFit.contain,
                  loadingBuilder: (c, child, progress) {
                    if (progress == null) return child;
                    return const Center(
                      child: CircularProgressIndicator(color: Colors.white),
                    );
                  },
                  errorBuilder: (c, e, s) => const Center(
                    child: Text(
                      "Không thể tải ảnh hiện trường",
                      style: TextStyle(color: Colors.white70),
                    ),
                  ),
                ),
              ),
            ),
            Positioned(
              top: MediaQuery.of(ctx).padding.top + 12,
              left: 16,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.black54,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Text(
                  "Ảnh hiện trường nạn nhân",
                  style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
                ),
              ),
            ),
            Positioned(
              top: MediaQuery.of(ctx).padding.top + 8,
              right: 16,
              child: IconButton(
                icon: const Icon(Icons.close, color: Colors.white, size: 28),
                onPressed: () => Navigator.pop(ctx),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final victimName = activeVictim?['fullName'] ??
        activeVictim?['full_name'] ??
        activeVictim?['name'] ??
        activeVictim?['victimName'] ??
        activeVictim?['victim_name'] ??
        'Không rõ';
    final victimPhone = activeVictim?['phone'] ??
        activeVictim?['phoneNumber'] ??
        activeVictim?['phone_number'] ??
        activeVictim?['victimPhone'] ??
        activeVictim?['victim_phone'];
    final displayIncidentType = incidentTypeName ?? activeVictim?['incidentTypeName'] ?? activeVictim?['serviceType'];
    final victimUserId = activeVictim?['userId'] ?? activeVictim?['user_id'] ?? activeVictim?['victimId'] ?? activeVictim?['victim_id'] ?? activeVictim?['id'];
    final resolvedSosId = sosRequestId ?? activeVictim?['sosRequestId'] ?? activeVictim?['sos_request_id'] ?? activeVictim?['sosId'] ?? activeVictim?['sos_id'];
    final String? rawImgUrl = (activeVictim?['imageUrl'] ?? activeVictim?['image_url'] ?? activeVictim?['image'] ?? activeVictim?['url'])?.toString();
    final bool hasImage = rawImgUrl != null && rawImgUrl.isNotEmpty;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ColorConstants.surfaceWhite,
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
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
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
              if (hasImage)
                GestureDetector(
                  onTap: () => _showFullImageModal(context, rawImgUrl!),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.red.shade600,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.red.withValues(alpha: 0.25),
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.photo_camera_outlined, size: 15, color: Colors.white),
                        SizedBox(width: 4),
                        Text(
                          "Xem ảnh",
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
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
                      DirectionService.formatDistance(distanceKm!),
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
                      "ETA: ${DirectionService.formatDuration(durationSec!)}",
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
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                        color: ColorConstants.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      "SĐT: ${victimPhone ?? 'Không rõ'}",
                      style: TextStyle(
                        fontSize: 13,
                        color: ColorConstants.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),

              
              Row(
                children: [
                  MessengerWidget(
                    phoneNumber: victimPhone?.toString(),
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
                  if (victimPhone != null && victimPhone.toString().trim().isNotEmpty) ...[
                    PhoneCallWidget(
                      phoneNumber: victimPhone.toString(),
                    ),
                  ],
                ],
              ),
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
              style: TextStyle(
                fontSize: 12,
                color: ColorConstants.textSecondary,
              ),
            ),
          ],
          if (hasImage) ...[
            const SizedBox(height: 8),
            GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTap: () => _showFullImageModal(context, rawImgUrl!),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Stack(
                  children: [
                    Image.network(
                      (activeVictim?['imageUrl'] ?? activeVictim?['image_url']).toString(),
                      height: 120,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      errorBuilder: (c, e, s) => const SizedBox.shrink(),
                    ),
                    Positioned(
                      bottom: 6,
                      right: 6,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.7),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.zoom_in, color: Colors.white, size: 14),
                            SizedBox(width: 4),
                            Text(
                              'Chạm để xem ảnh toàn màn hình',
                              style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
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
            onPressed: () async {
              final confirm = await RescueCompletionDialogWidget.show(
                context,
                victimName: victimName != 'Không rõ' ? victimName : null,
              );
              if (confirm == true) {
                onComplete();
              }
            },
            child: const Text(
              "Hoàn thành cứu hộ",
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 15,
              ),
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => _onCancelPressed(context),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: ColorConstants.danger,
                    side: BorderSide(color: ColorConstants.danger),
                    minimumSize: const Size.fromHeight(44),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  icon: const Icon(Icons.cancel_outlined, size: 18),
                  label: const Text(
                    "Hủy cứu hộ",
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => EmergencyDialogWidget.show(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ColorConstants.dangerHigh,
                    minimumSize: const Size.fromHeight(44),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  icon: const Icon(Icons.emergency_outlined, size: 18),
                  label: const Text(
                    "Gọi khẩn cấp",
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
