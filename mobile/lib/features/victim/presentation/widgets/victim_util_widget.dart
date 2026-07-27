import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile/core/di/di.dart';
import 'package:mobile/core/location/data/location_service.dart';
import 'package:mobile/core/session/session_controller.dart';
import 'package:mobile/features/dangerous_points/presentation/widgets/add_dangerous_point_dialog.dart';
import 'package:mobile/features/emergency_amenities/presentation/widgets/add_amenity_bottom_sheet.dart';
import '../providers/victim_map_provider.dart';
import 'emergency_qr_dialog_widget.dart';

class VictimUtilWidget extends StatefulWidget {
  final VoidCallback? onCallTap;
  final VoidCallback? onLocationTap;

  const VictimUtilWidget({
    super.key,
    this.onCallTap,
    this.onLocationTap,
  });

  @override
  State<VictimUtilWidget> createState() => _VictimUtilWidgetState();
}

class _VictimUtilWidgetState extends State<VictimUtilWidget> {
  Future<void> _handleAmenityTap(BuildContext context) async {
    final session = getIt<SessionController>();
    var position = session.state.position;
    
    if (position == null) {
      position = await LocationService().getCurrentPosition();
      if (position != null) {
        session.updatePosition(position);
      }
    }
    
    if (position != null && context.mounted) {
      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (_) => AddAmenityBottomSheet(
          currentLat: position!.latitude,
          currentLng: position.longitude,
        ),
      );
    } else {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Vui lòng bật định vị để đóng góp điểm tiện ích!'),
            backgroundColor: Colors.orange,
            duration: Duration(seconds: 3),
          ),
        );
      }
    }
  }

  Future<void> _handleWarningTap(BuildContext context) async {
    final session = getIt<SessionController>();
    var position = session.state.position;
    
    if (position == null) {
      // Try to get current position directly if session's position is null
      position = await LocationService().getCurrentPosition();
      if (position != null) {
        session.updatePosition(position);
      }
    }
    
    if (position != null && context.mounted) {
      AddDangerousPointDialog.show(
        context,
        latitude: position.latitude,
        longitude: position.longitude,
      );
    } else {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Vui lòng bật định vị để báo cáo điểm nguy hiểm!'),
            backgroundColor: Colors.orange,
            duration: Duration(seconds: 3),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final activeSosId = context.watch<VictimMapProvider>().activeSosRequestId;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (activeSosId != null) ...[
          _UtilButton(
            tooltip: 'Mã QR Cứu Hộ',
            icon: Icons.qr_code_2_rounded,
            color: const Color(0xFF9333EA),
            onPressed: () {
              EmergencyQRDialogWidget.show(
                context,
                sosRequestId: activeSosId,
              );
            },
          ),
          const SizedBox(height: 6),
        ],
        _UtilButton(
          tooltip: 'Tiện ích cộng đồng',
          icon: Icons.storefront_rounded,
          color: const Color(0xFF10B981),
          onPressed: () => _handleAmenityTap(context),
        ),
        const SizedBox(height: 6),
        _UtilButton(
          tooltip: 'Cảnh báo',
          icon: Icons.warning_rounded,
          color: const Color(0xFFF97316),
          onPressed: () => _handleWarningTap(context),
        ),
        const SizedBox(height: 6),
        _UtilButton(
          tooltip: 'Khẩn cấp',
          icon: Icons.phone,
          color: const Color(0xFFF91616),
          onPressed: widget.onCallTap ?? () {},
        ),
        const SizedBox(height: 6),
        _UtilButton(
          tooltip: 'Vị trí của tôi',
          icon: Icons.my_location,
          color: const Color(0xFF2563EB),
          onPressed: widget.onLocationTap ?? () {},
        ),
      ],
    );
  }
}

class _UtilButton extends StatelessWidget {
  const _UtilButton({
    required this.tooltip,
    required this.icon,
    required this.color,
    required this.onPressed,
  });

  final String tooltip;
  final IconData icon;
  final Color color;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 48,
      width: 48,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.black.withValues(alpha: 0.06)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.10),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: IconButton(
        tooltip: tooltip,
        onPressed: onPressed,
        icon: Icon(icon),
        color: color,
      ),
    );
  }
}
