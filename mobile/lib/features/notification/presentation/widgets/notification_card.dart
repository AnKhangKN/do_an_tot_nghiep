import 'package:flutter/material.dart';
import '../../../../core/constants/color_constants.dart';

/// Card hiển thị thông tin chi tiết của một thông báo hệ thống.
class NotificationCard extends StatelessWidget {
  final String title;
  final String message;
  final String time;
  final String type;
  final bool isRead;

  const NotificationCard({
    super.key,
    required this.title,
    required this.message,
    required this.time,
    required this.type,
    required this.isRead,
  });

  Color get typeColor {
    switch (type) {
      case "emergency":
        return ColorConstants.redRescue;
      case "success":
        return ColorConstants.success;
      case "warning":
        return ColorConstants.orangeWarning;
      case "moving":
        return ColorConstants.info;
      default:
        return ColorConstants.textSecondary;
    }
  }

  IconData get typeIcon {
    switch (type) {
      case "emergency":
        return Icons.campaign_rounded;
      case "success":
        return Icons.check_circle_rounded;
      case "warning":
        return Icons.report_problem_rounded;
      case "moving":
        return Icons.near_me_rounded;
      default:
        return Icons.notifications_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: isRead ? ColorConstants.surfaceWhite.withOpacity(0.8) : ColorConstants.surfaceWhite,
        clipBehavior: Clip.antiAlias,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: !isRead
              ? BorderSide(color: typeColor.withOpacity(0.5), width: 1.5)
              : BorderSide.none,
        ),
        child: ListTile(
          contentPadding: const EdgeInsets.all(16),
          leading: Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: typeColor.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(typeIcon, color: typeColor, size: 28),
          ),
          title: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      title,
                      style: TextStyle(
                        fontWeight: isRead ? FontWeight.w700 : FontWeight.w900,
                        fontSize: 15,
                        color: isRead ? ColorConstants.textPrimary : Colors.black,
                      ),
                    ),
                  ),
                  if (!isRead)
                    const CircleAvatar(radius: 4, backgroundColor: ColorConstants.redRescue),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                time,
                style: const TextStyle(color: ColorConstants.textSecondary, fontSize: 11),
              ),
            ],
          ),
          subtitle: Padding(
            padding: const EdgeInsets.only(top: 10),
            child: Text(
              message,
              style: TextStyle(
                color: isRead ? ColorConstants.textSecondary : ColorConstants.textPrimary,
                fontSize: 13,
                height: 1.4,
              ),
            ),
          ),
          onTap: () {},
        ),
      ),
    );
  }
}
