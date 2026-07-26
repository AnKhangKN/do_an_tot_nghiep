import 'package:flutter/material.dart';
import '../../core/dangerous_points/models/dangerous_point_model.dart';

class GeofenceAlertDialog extends StatelessWidget {
  final DangerousPointModel point;
  final double distanceMeters;
  final VoidCallback onDismiss;

  const GeofenceAlertDialog({
    super.key,
    required this.point,
    required this.distanceMeters,
    required this.onDismiss,
  });

  static Future<void> show(
    BuildContext context, {
    required DangerousPointModel point,
    required double distanceMeters,
    required VoidCallback onDismiss,
  }) {
    return showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => GeofenceAlertDialog(
        point: point,
        distanceMeters: distanceMeters,
        onDismiss: () {
          Navigator.of(context).pop();
          onDismiss();
        },
      ),
    );
  }

  Color _getDangerColor(String level) {
    switch (level.toUpperCase()) {
      case 'HIGH':
        return const Color(0xFFDC2626); // Đỏ
      case 'MEDIUM':
        return const Color(0xFFF97316); // Cam
      case 'LOW':
        return const Color(0xFF10B981); // Xanh lá dịu
      default:
        return const Color(0xFFDC2626);
    }
  }

  IconData _getDangerIcon(String level) {
    switch (level.toUpperCase()) {
      case 'HIGH':
        return Icons.dangerous_rounded;
      case 'MEDIUM':
        return Icons.warning_amber_rounded;
      case 'LOW':
        return Icons.info_outline_rounded;
      default:
        return Icons.warning_amber_rounded;
    }
  }

  String _getDangerText(String level) {
    switch (level.toUpperCase()) {
      case 'HIGH':
        return 'Mức độ: RẤT NGUY HIỂM';
      case 'MEDIUM':
        return 'Mức độ: NGUY HIỂM VỪA';
      case 'LOW':
        return 'Mức độ: THÔNG BÁO RỦI RO THẤP';
      default:
        return 'Mức độ: NGUY HIỂM';
    }
  }

  @override
  Widget build(BuildContext context) {
    final dangerColor = _getDangerColor(point.dangerLevel);

    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      title: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: dangerColor.withOpacity(0.12),
              shape: BoxShape.circle,
            ),
            child: Icon(_getDangerIcon(point.dangerLevel), color: dangerColor, size: 42),
          ),
          const SizedBox(height: 12),
          Text(
            'CẢNH BÁO VÙNG NGUY HIỂM!',
            style: TextStyle(
              fontWeight: FontWeight.w900,
              fontSize: 17,
              color: dangerColor,
              letterSpacing: 0.5,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 4),
          Text(
            'Bạn đang ở gần vị trí được cảnh báo rủi ro',
            style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
            textAlign: TextAlign.center,
          ),
        ],
      ),
      content: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade300),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.location_on, color: dangerColor, size: 20),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          point.zoneName,
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                          ),
                        ),
                      ),
                    ],
                  ),
                  if (point.address != null && point.address!.isNotEmpty) ...[
                    const SizedBox(height: 6),
                    Text(
                      point.address!,
                      style: TextStyle(fontSize: 13, color: Colors.grey.shade700),
                    ),
                  ],
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 4,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: dangerColor,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          _getDangerText(point.dangerLevel),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.blue.shade700,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          'Cách bạn: ${distanceMeters.toStringAsFixed(0)} m',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            if (point.description != null && point.description!.isNotEmpty) ...[
              const SizedBox(height: 12),
              const Text(
                'Mô tả nguy hiểm:',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
              ),
              const SizedBox(height: 4),
              Text(
                point.description!,
                style: TextStyle(fontSize: 13, color: Colors.grey.shade800, height: 1.4),
              ),
            ],
          ],
        ),
      ),
      actions: [
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: onDismiss,
            style: ElevatedButton.styleFrom(
              backgroundColor: dangerColor,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              padding: const EdgeInsets.symmetric(vertical: 12),
            ),
            child: const Text(
              'Tôi đã hiểu & Chú ý quan sát',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
            ),
          ),
        ),
      ],
    );
  }
}
