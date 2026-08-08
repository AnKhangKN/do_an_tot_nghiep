import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile/core/constants/color_constants.dart';
import 'package:mobile/core/di/di.dart';
import 'package:mobile/core/session/app_session.dart';
import 'package:mobile/core/session/session_controller.dart';
import 'package:mobile/core/utils/app_snackbar.dart';
import 'package:mobile/features/chat/presentation/providers/chat_provider.dart';
import 'package:mobile/features/chat/presentation/screens/messenger_screen.dart';
import 'package:mobile/features/victim/data/victim_service.dart';
import 'package:mobile/shared/widgtes/messenger_widget.dart';
import 'package:mobile/shared/widgtes/phone_call_widget.dart';
import 'package:mobile/shared/widgtes/emergency_dialog_widget.dart';

class VictimRescueInfoWidget extends StatefulWidget {
  final Map<String, dynamic>? activeRescuer;
  final double? distanceKm; // Khoảng cách của cứu hộ viên tới vị trí nạn nhân (km)
  final int? durationSec; // Thời gian dự kiến đến nơi (giây)

  const VictimRescueInfoWidget({
    super.key,
    required this.activeRescuer,
    this.distanceKm,
    this.durationSec,
  });

  @override
  State<VictimRescueInfoWidget> createState() => _VictimRescueInfoWidgetState();
}

class _VictimRescueInfoWidgetState extends State<VictimRescueInfoWidget> {
  static const int _cancelTimeoutSeconds = 15;

  Timer? _cancelTimer;
  int _secondsLeft = _cancelTimeoutSeconds;

  @override
  void initState() {
    super.initState();
    // Nút "Hủy cứu hộ" chỉ hiển thị trong 15 giây đầu, sau đó tự ẩn
    _cancelTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      if (_secondsLeft <= 1) {
        timer.cancel();
        setState(() => _secondsLeft = 0);
      } else {
        setState(() => _secondsLeft -= 1);
      }
    });
  }

  @override
  void dispose() {
    _cancelTimer?.cancel();
    super.dispose();
  }

  String? get _sosRequestId {
    final activeRescuer = widget.activeRescuer;
    return activeRescuer?['sosRequestId'] ??
        activeRescuer?['sos_request_id'] ??
        activeRescuer?['sosId'] ??
        activeRescuer?['sos_id'];
  }

  Future<void> _cancelRescue() async {
    final sosId = _sosRequestId;
    if (sosId == null) {
      AppSnackBar.show(
        context,
        'Không xác định được ca cứu hộ hiện tại!',
        type: AppSnackBarType.error,
      );
      return;
    }

    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Hủy ca cứu hộ'),
        content: const Text(
          'Bạn có chắc chắn muốn hủy ca cứu hộ này không? Người cứu hộ sẽ được thông báo.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Quay lại'),
          ),
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: TextButton.styleFrom(
              foregroundColor: ColorConstants.danger,
            ),
            child: const Text('Đồng ý hủy'),
          ),
        ],
      ),
    );

    if (confirm != true || !mounted) return;

    try {
      await getIt<VictimService>().cancelSos(sosRequestId: sosId);
      if (!mounted) return;
      getIt<SessionController>().endBeingRescued();
      AppSnackBar.show(
        context,
        'Đã hủy ca cứu hộ.',
        type: AppSnackBarType.success,
      );
    } catch (e) {
      if (!mounted) return;
      AppSnackBar.show(
        context,
        'Không thể hủy ca cứu hộ. Vui lòng thử lại!',
        type: AppSnackBarType.error,
      );
    }
  }

  /// Chuyển số giây thành chuỗi dễ đọc
  String _formatDuration(int seconds) {
    if (seconds < 60) return "< 1 phút";
    final minutes = seconds ~/ 60;
    if (minutes < 60) return "~$minutes phút nữa";
    final hours = minutes ~/ 60;
    final remainMins = minutes % 60;
    return remainMins > 0 ? "~$hours giờ $remainMins ph" : "~$hours giờ nữa";
  }

  @override
  Widget build(BuildContext context) {
    final name = widget.activeRescuer?['fullName'] ??
        widget.activeRescuer?['full_name'] ??
        widget.activeRescuer?['name'] ??
        widget.activeRescuer?['rescuerName'] ??
        widget.activeRescuer?['rescuer_name'] ??
        'Không rõ';
    final phone = widget.activeRescuer?['phone'] ??
        widget.activeRescuer?['phoneNumber'] ??
        widget.activeRescuer?['phone_number'] ??
        widget.activeRescuer?['rescuerPhone'] ??
        widget.activeRescuer?['rescuer_phone'];
    final rescuerUserId = widget.activeRescuer?['userId'] ?? widget.activeRescuer?['user_id'] ?? widget.activeRescuer?['rescuerId'] ?? widget.activeRescuer?['rescuer_id'] ?? widget.activeRescuer?['id'];
    final sosRequestId = widget.activeRescuer?['sosRequestId'] ?? widget.activeRescuer?['sos_request_id'] ?? widget.activeRescuer?['sosId'] ?? widget.activeRescuer?['sos_id'];

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

          // Chip ETA có màu xanh lá tạo cảm giác an toàn cho nạn nhân
          if (widget.distanceKm != null || widget.durationSec != null) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFFDCFCE7),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF16A34A), width: 1),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (widget.distanceKm != null) ...[
                    const Icon(Icons.route, size: 15, color: Color(0xFF16A34A)),
                    const SizedBox(width: 4),
                    Text(
                      widget.distanceKm! < 1
                          ? "${(widget.distanceKm! * 1000).toStringAsFixed(0)} m"
                          : "${widget.distanceKm!.toStringAsFixed(1)} km",
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF16A34A),
                      ),
                    ),
                  ],
                  if (widget.distanceKm != null && widget.durationSec != null)
                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 8),
                      child: Text("·", style: TextStyle(color: Color(0xFF16A34A))),
                    ),
                  if (widget.durationSec != null) ...[
                    const Icon(Icons.access_time, size: 15, color: Color(0xFF16A34A)),
                    const SizedBox(width: 4),
                    Text(
                      _formatDuration(widget.durationSec!),
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF16A34A),
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
                      "Họ tên: $name",
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                        color: ColorConstants.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      "SĐT: ${phone ?? 'Không rõ'}",
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
                    phoneNumber: phone?.toString(),
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
                        await Navigator.of(context, rootNavigator: true).push(
                          MaterialPageRoute(
                            builder: (context) => MessengerScreen(conversation: conv),
                          ),
                        );
                        // Tự động đồng bộ lại trạng thái khi quay về màn hình bản đồ
                        getIt<AppSession>().checkAndRestoreActiveRescue();
                      }
                    },
                  ),
                  if (phone != null && phone.toString().trim().isNotEmpty) ...[
                    PhoneCallWidget(
                      phoneNumber: phone.toString(),
                    ),
                  ],
                ],
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              if (_secondsLeft > 0) ...[
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _cancelRescue,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: ColorConstants.danger,
                      side: BorderSide(color: ColorConstants.danger),
                      minimumSize: const Size.fromHeight(44),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    icon: const Icon(Icons.cancel_outlined, size: 18),
                    label: Text(
                      'Hủy cứu hộ ($_secondsLeft s)',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
              ],
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
                    'Gọi khẩn cấp',
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
