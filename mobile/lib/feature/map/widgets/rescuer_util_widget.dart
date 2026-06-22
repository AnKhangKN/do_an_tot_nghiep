import 'package:flutter/material.dart';

class RescuerUtilWidget extends StatelessWidget {
  const RescuerUtilWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Container(
        margin: const EdgeInsets.all(16),
        padding: const EdgeInsets.symmetric(vertical: 12),
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
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            _UtilButton(
              icon: Icons.motorcycle,
              label: "Loại sự cố",
            ),
            _UtilButton(
              icon: Icons.my_location,
              label: "Định vị",
            ),
            _UtilButton(
              icon: Icons.phone,
              label: "Khẩn cấp",
            ),
            _UtilButton(
              icon: Icons.flag,
              label: "Cảnh báo",
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

  const _UtilButton({
    required this.icon,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(12),
      onTap: () {},
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