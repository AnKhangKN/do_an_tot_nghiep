import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';
import 'package:mobile/core/constants/color_constants.dart';
import 'package:mobile/core/di/di.dart';
import 'package:mobile/core/location/data/location_service.dart';
import 'package:mobile/core/session/session_controller.dart';
import 'package:mobile/core/utils/app_snackbar.dart';
import 'package:mobile/features/dangerous_points/presentation/widgets/add_dangerous_point_dialog.dart';
import '../screens/qr_scanner_screen.dart';

import 'package:mobile/features/emergency_amenities/presentation/widgets/add_amenity_bottom_sheet.dart';

class RescuerUtilWidget extends StatelessWidget {
  final VoidCallback? onIncidentTypeTap;
  final VoidCallback? onLocationTap;
  final VoidCallback? onEmergencyTap;

  const RescuerUtilWidget({
    super.key,
    this.onIncidentTypeTap,
    this.onLocationTap,
    this.onEmergencyTap,
  });

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
        AppSnackBar.show(
          context,
          'Vui lòng bật định vị để đóng góp điểm tiện ích!',
          type: AppSnackBarType.warning,
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
        AppSnackBar.show(
          context,
          'Vui lòng bật định vị để báo cáo điểm nguy hiểm!',
          type: AppSnackBarType.warning,
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 12),
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 0),
        decoration: BoxDecoration(
          color: ColorConstants.surfaceWhite,
          borderRadius: BorderRadius.circular(18),
          boxShadow: const [
            BoxShadow(
              color: Colors.black12,
              blurRadius: 10,
              offset: Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            _UtilButton(
              icon: Icons.qr_code_scanner_rounded,
              label: "Quét QR",
              onTap: () async {
                final result = await Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (ctx) => const QRScannerScreen(),
                  ),
                );
                if (result == true) {
                  getIt<SessionController>().notifyListeners();
                }
              },
            ),
            _UtilButton(
              icon: Icons.storefront_rounded,
              label: "Tiện ích",
              onTap: () => _handleAmenityTap(context),
            ),
            _UtilButton(
              icon: Icons.my_location,
              label: "Định vị",
              onTap: onLocationTap,
            ),
            _UtilButton(
              icon: Icons.phone,
              label: "Khẩn cấp",
              onTap: onEmergencyTap,
            ),
            _UtilButton(
              icon: Icons.flag,
              label: "Cảnh báo",
              onTap: () => _handleWarningTap(context),
            ),
          ],
        ),
      ),
    );
  }
}

class _UtilButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback? onTap;

  const _UtilButton({
    required this.icon,
    required this.label,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(12),
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: 8,
          vertical: 4,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 28,
              color: ColorConstants.redRescue,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}