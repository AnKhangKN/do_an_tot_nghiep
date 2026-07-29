import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:mobile/core/constants/color_constants.dart';
import 'package:mobile/core/dangerous_points/data/dangerous_point_repository.dart';
import 'package:mobile/core/di/di.dart';

class HazardFeedbackDialog extends StatefulWidget {
  final String dangerousPointId;
  final String zoneName;

  const HazardFeedbackDialog({
    super.key,
    required this.dangerousPointId,
    required this.zoneName,
  });

  static Future<bool?> show(
    BuildContext context, {
    required String dangerousPointId,
    required String zoneName,
  }) async {
    return showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (dialogContext) => HazardFeedbackDialog(
        dangerousPointId: dangerousPointId,
        zoneName: zoneName,
      ),
    );
  }

  @override
  State<HazardFeedbackDialog> createState() => _HazardFeedbackDialogState();
}

class _HazardFeedbackDialogState extends State<HazardFeedbackDialog> {
  String _selectedType = 'VERIFY_REAL';
  final TextEditingController _commentController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    setState(() => _isSubmitting = true);
    try {
      final repository = getIt<DangerousPointRepository>();
      await repository.submitFeedback(
        pointId: widget.dangerousPointId,
        feedbackType: _selectedType,
        comment: _commentController.text.trim().isNotEmpty
            ? _commentController.text.trim()
            : null,
      );

      if (mounted) {
        Navigator.of(context).pop(true);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Cảm ơn bạn! Đã gửi phản hồi xác minh thành công.'),
            backgroundColor: ColorConstants.amenityGreen,
          ),
        );
      }
    } catch (e) {
      debugPrint('Lỗi khi gửi phản hồi xác minh điểm nguy hiểm: $e');
      String errorMsg = 'Gửi phản hồi thất bại. Vui lòng thử lại!';
      if (e is DioException && e.response?.data != null) {
        final data = e.response!.data;
        if (data is Map && data['message'] != null) {
          errorMsg = data['message'].toString();
        }
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errorMsg),
            backgroundColor: ColorConstants.danger,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  Widget _buildOptionTile({
    required String type,
    required String title,
    required String subtitle,
    required IconData icon,
    required Color activeColor,
  }) {
    final isSelected = _selectedType == type;
    return InkWell(
      onTap: () => setState(() => _selectedType = type),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? activeColor.withOpacity(0.08) : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? activeColor : const Color(0xFFE2E8F0),
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(icon, color: isSelected ? activeColor : const Color(0xFF64748B), size: 22),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 13.5,
                      fontWeight: FontWeight.bold,
                      color: isSelected ? activeColor : const Color(0xFF1E293B),
                    ),
                  ),
                  Text(
                    subtitle,
                    style: const TextStyle(fontSize: 11.5, color: Color(0xFF64748B)),
                  ),
                ],
              ),
            ),
            Radio<String>(
              value: type,
              groupValue: _selectedType,
              activeColor: activeColor,
              onChanged: (val) {
                if (val != null) setState(() => _selectedType = val);
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final viewInsets = MediaQuery.of(context).viewInsets;

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.only(
        bottom: viewInsets.bottom + 16,
        top: 12,
        left: 20,
        right: 20,
      ),
      child: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Thanh kéo drag handle
            Center(
              child: Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(bottom: 14),
                decoration: BoxDecoration(
                  color: const Color(0xFFCBD5E1),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),

            // Header
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.orange.shade50,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.rate_review_rounded,
                    color: Colors.orange,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Phản hồi & Xác minh',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF0F172A),
                        ),
                      ),
                      Text(
                        widget.zoneName,
                        style: const TextStyle(
                          fontSize: 12,
                          color: Color(0xFF64748B),
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Options List
            _buildOptionTile(
              type: 'VERIFY_REAL',
              title: '👍 Xác nhận điểm này có thật',
              subtitle: 'Điểm nguy hiểm/sự cố đúng với thực tế hiện trường',
              icon: Icons.thumb_up_alt_rounded,
              activeColor: const Color(0xFF16A34A),
            ),
            const SizedBox(height: 8),

            _buildOptionTile(
              type: 'REPORT_FAKE',
              title: '⚠️ Báo cáo điểm giả mạo',
              subtitle: 'Thông tin địa điểm sai sự thật hoặc bị cố ý đặt giả',
              icon: Icons.report_problem_rounded,
              activeColor: const Color(0xFFDC2626),
            ),
            const SizedBox(height: 8),

            _buildOptionTile(
              type: 'MARKED_RESOLVED',
              title: '✅ Báo cáo đã an toàn / hết sự cố',
              subtitle: 'Sự cố đã được giải quyết hoặc nước đã rút hoàn toàn',
              icon: Icons.verified_user_rounded,
              activeColor: const Color(0xFF2563EB),
            ),
            const SizedBox(height: 8),

            _buildOptionTile(
              type: 'STILL_DANGEROUS',
              title: '🔥 Xác nhận vẫn còn nguy hiểm',
              subtitle: 'Mức độ rủi ro vẫn còn cao, chưa an toàn cho di chuyển',
              icon: Icons.warning_amber_rounded,
              activeColor: const Color(0xFFD97706),
            ),
            const SizedBox(height: 14),

            // Comment Field
            const Text(
              'Ghi chú bổ sung (không bắt buộc):',
              style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600, color: Color(0xFF334155)),
            ),
            const SizedBox(height: 6),
            TextField(
              controller: _commentController,
              maxLines: 2,
              style: const TextStyle(fontSize: 13),
              decoration: InputDecoration(
                hintText: 'Nhập chi tiết tình hình thực tế hiện tại...',
                hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                contentPadding: const EdgeInsets.all(12),
                filled: true,
                fillColor: const Color(0xFFF8FAFC),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFF3B82F6), width: 1.5),
                ),
              ),
            ),
            const SizedBox(height: 18),

            // Action Buttons
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Color(0xFFCBD5E1)),
                      backgroundColor: const Color(0xFFF8FAFC),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    onPressed: _isSubmitting ? null : () => Navigator.of(context).pop(false),
                    child: const Text(
                      'Hủy',
                      style: TextStyle(color: Color(0xFF475569), fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0F172A),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 0,
                    ),
                    onPressed: _isSubmitting ? null : _handleSubmit,
                    child: _isSubmitting
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : const Text(
                            'Gửi phản hồi',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
