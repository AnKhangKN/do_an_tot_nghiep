import 'package:flutter/material.dart';

class VictimUtilWidget extends StatefulWidget {
  const VictimUtilWidget({super.key});

  @override
  State<VictimUtilWidget> createState() => _VictimUtilWidgetState();
}

class _VictimUtilWidgetState extends State<VictimUtilWidget> {
  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        _UtilButton(
          tooltip: 'Canh bao',
          icon: Icons.warning_amber_rounded,
          color: const Color(0xFFF97316),
          onPressed: () {},
        ),
        const SizedBox(height: 6),
        _UtilButton(
          tooltip: 'Goi dien',
          icon: Icons.phone,
          color: const Color(0xFF16A34A),
          onPressed: () {},
        ),
        const SizedBox(height: 6),
        _UtilButton(
          tooltip: 'Vi tri cua toi',
          icon: Icons.my_location,
          color: const Color(0xFF2563EB),
          onPressed: () {},
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
