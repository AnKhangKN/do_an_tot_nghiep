import 'package:flutter/material.dart';

class RescuerUtilWidget extends StatelessWidget {
  final VoidCallback? onIncidentTypeTap;
  final VoidCallback? onLocationTap;
  final VoidCallback? onEmergencyTap;
  final VoidCallback? onWarningTap;

  const RescuerUtilWidget({
    super.key,
    this.onIncidentTypeTap,
    this.onLocationTap,
    this.onEmergencyTap,
    this.onWarningTap,
  });

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 12),
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 0),
        decoration: BoxDecoration(
          color: Colors.white,
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
              icon: Icons.motorcycle,
              label: "Loại sự cố",
              onTap: onIncidentTypeTap,
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
              onTap: onWarningTap,
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
              color: Colors.red,
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