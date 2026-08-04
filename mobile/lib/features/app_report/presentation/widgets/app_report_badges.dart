import 'package:flutter/material.dart';
import '../../../../core/constants/color_constants.dart';

/// Chip hiển thị danh mục báo cáo ứng dụng
class AppReportCategoryChip extends StatelessWidget {
  final String category;
  final bool selected;
  final VoidCallback? onTap;

  const AppReportCategoryChip({
    super.key,
    required this.category,
    this.selected = false,
    this.onTap,
  });

  Color get _color {
    switch (category) {
      case 'BUG':
        return ColorConstants.error;
      case 'SUGGESTION':
        return ColorConstants.success;
      case 'CONTENT':
        return ColorConstants.orangeWarning;
      case 'OTHER':
      default:
        return ColorConstants.textSecondary;
    }
  }

  IconData get _icon {
    switch (category) {
      case 'BUG':
        return Icons.bug_report_outlined;
      case 'SUGGESTION':
        return Icons.lightbulb_outline;
      case 'CONTENT':
        return Icons.warning_amber_rounded;
      case 'OTHER':
      default:
        return Icons.forum_outlined;
    }
  }

  String get _label {
    switch (category) {
      case 'BUG':
        return 'Lỗi ứng dụng';
      case 'SUGGESTION':
        return 'Góp ý cải tiến';
      case 'CONTENT':
        return 'Nội dung không phù hợp';
      case 'OTHER':
      default:
        return 'Khác';
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = selected ? _color : ColorConstants.textSecondary;
    return Material(
      color: selected ? _color.withOpacity(0.12) : ColorConstants.surfaceWhite,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: selected ? _color : ColorConstants.border,
              width: selected ? 1.5 : 1,
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(_icon, size: 16, color: color),
              const SizedBox(width: 6),
              Text(
                _label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: color,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Badge hiển thị trạng thái xử lý báo cáo
class AppReportStatusBadge extends StatelessWidget {
  final String status;

  const AppReportStatusBadge({super.key, required this.status});

  (Color, IconData, String) get _meta {
    switch (status) {
      case 'PENDING':
        return (ColorConstants.orangeWarning, Icons.hourglass_top_rounded, 'Chờ xử lý');
      case 'IN_PROGRESS':
        return (ColorConstants.info, Icons.settings_suggest_outlined, 'Đang xử lý');
      case 'RESOLVED':
        return (ColorConstants.success, Icons.check_circle_outline, 'Đã xử lý');
      case 'REJECTED':
        return (ColorConstants.error, Icons.cancel_outlined, 'Từ chối');
      default:
        return (ColorConstants.textSecondary, Icons.help_outline, status);
    }
  }

  @override
  Widget build(BuildContext context) {
    final (color, icon, label) = _meta;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.35)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w800,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
