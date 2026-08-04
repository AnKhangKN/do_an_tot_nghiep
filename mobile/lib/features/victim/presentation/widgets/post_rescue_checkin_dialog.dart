import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:mobile/core/constants/color_constants.dart';
import 'package:mobile/core/di/di.dart';
import 'package:mobile/core/utils/app_snackbar.dart';
import 'package:mobile/features/victim/data/victim_repository.dart';

class PostRescueCheckinDialog extends StatefulWidget {
  final String sosRequestId;
  final String? rescuerName;

  const PostRescueCheckinDialog({
    super.key,
    required this.sosRequestId,
    this.rescuerName,
  });

  static Future<void> show(
    BuildContext context, {
    required String sosRequestId,
    String? rescuerName,
  }) async {
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => PostRescueCheckinDialog(
        sosRequestId: sosRequestId,
        rescuerName: rescuerName,
      ),
    );
  }

  @override
  State<PostRescueCheckinDialog> createState() => _PostRescueCheckinDialogState();
}

class _PostRescueCheckinDialogState extends State<PostRescueCheckinDialog> {
  String _selectedHealthStatus = 'SAFE'; // 'SAFE', 'NEEDS_MEDICAL_CHECK', 'RECOVERING'
  int _selectedRating = 5;
  int _responseSpeed = 5;
  int _attitude = 5;
  int _supportLevel = 5;
  final TextEditingController _notesController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    setState(() => _isSubmitting = true);
    try {
      final victimRepository = getIt<VictimRepository>();
      await victimRepository.submitPostRescueCheckin(
        sosRequestId: widget.sosRequestId,
        healthStatus: _selectedHealthStatus,
        checkinNotes: _notesController.text.trim(),
        rating: _selectedRating,
        responseSpeed: _responseSpeed,
        attitude: _attitude,
        supportLevel: _supportLevel,
        comment: _notesController.text.trim(),
      );

      if (mounted) {
        Navigator.of(context).pop();
        AppSnackBar.show(
          context,
          'Cảm ơn bạn! Đã ghi nhận xác nhận an toàn sau cứu hộ.',
          type: AppSnackBarType.success,
        );
      }
    } catch (e) {
      debugPrint('Lỗi gửi post-rescue checkin: $e');
      String errorMsg = 'Đánh giá bị từ chối do có lỗi xảy ra.';
      if (e is DioException && e.response?.data != null) {
        final data = e.response!.data;
        if (data is Map && data['message'] != null) {
          errorMsg = data['message'].toString();
        }
      } else {
        errorMsg = e.toString();
      }

      if (mounted) {
        AppSnackBar.show(
          context,
          errorMsg,
          type: AppSnackBarType.error,
          duration: const Duration(seconds: 4),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: ColorConstants.surfaceWhite,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(28),
          topRight: Radius.circular(28),
        ),
      ),
      child: SafeArea(
        child: MediaQuery.removeViewInsets(
          removeBottom: true,
          context: context,
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: ColorConstants.amenityGreen.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Icon(
                      Icons.health_and_safety_rounded,
                      color: ColorConstants.amenityGreen,
                      size: 26,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Theo Dõi Sau Cứu Hộ',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: ColorConstants.slateDark,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          widget.rescuerName != null
                              ? 'Ca hỗ trợ của ${widget.rescuerName} đã hoàn thành'
                              : 'Ca cứu hộ của bạn đã hoàn thành',
                          style: TextStyle(
                            fontSize: 12,
                            color: ColorConstants.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: Icon(Icons.close, color: ColorConstants.textMuted),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Trạng thái Sức khỏe (Health Status Selection)
              Text(
                'Tình trạng sức khỏe hiện tại của bạn:',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: ColorConstants.textPrimary,
                ),
              ),
              const SizedBox(height: 10),

              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _buildHealthChip(
                    label: '✅ Tôi Đã An Toàn',
                    value: 'SAFE',
                    color: ColorConstants.amenityGreen,
                  ),
                  _buildHealthChip(
                    label: '🏥 Cần Kiểm Tra Y Tế',
                    value: 'NEEDS_MEDICAL_CHECK',
                    color: ColorConstants.dangerHigh,
                  ),
                  _buildHealthChip(
                    label: '🩹 Đang Hồi Phục',
                    value: 'RECOVERING',
                    color: ColorConstants.dangerMedium,
                  ),
                  _buildHealthChip(
                    label: '💬 Khác / Ý Kiến Khác',
                    value: 'OTHER',
                    color: ColorConstants.purpleQR,
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Đánh giá Cứu hộ viên (Overall + 3 khía cạnh)
              Text(
                'Đánh giá chất lượng hỗ trợ:',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: ColorConstants.textPrimary,
                ),
              ),
              const SizedBox(height: 8),

              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(5, (index) {
                  final starIndex = index + 1;
                  return IconButton(
                    onPressed: () => setState(() => _selectedRating = starIndex),
                    icon: Icon(
                      starIndex <= _selectedRating ? Icons.star_rounded : Icons.star_outline_rounded,
                      color: Colors.amber.shade600,
                      size: 36,
                    ),
                  );
                }),
              ),
              const SizedBox(height: 8),

              _buildAspectStarRow(
                label: '⚡ Tốc độ phản ứng',
                value: _responseSpeed,
                onChanged: (v) => setState(() => _responseSpeed = v),
              ),
              const SizedBox(height: 8),
              _buildAspectStarRow(
                label: '🤝 Thái độ phục vụ',
                value: _attitude,
                onChanged: (v) => setState(() => _attitude = v),
              ),
              const SizedBox(height: 8),
              _buildAspectStarRow(
                label: '🛟 Mức độ hỗ trợ',
                value: _supportLevel,
                onChanged: (v) => setState(() => _supportLevel = v),
              ),
              const SizedBox(height: 16),

              // Ô nhập Ghi chú / Phản hồi
              TextField(
                controller: _notesController,
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: 'Nhập phản hồi hoặc ghi chú sức khỏe bổ sung...',
                  hintStyle: TextStyle(fontSize: 12, color: ColorConstants.textMuted),
                  filled: true,
                  fillColor: ColorConstants.bgCanvas,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide(color: ColorConstants.border),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide(color: ColorConstants.border),
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Submit Button
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton.icon(
                  onPressed: _isSubmitting ? null : _handleSubmit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ColorConstants.amenityGreen,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    elevation: 2,
                  ),
                  icon: _isSubmitting
                      ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Icon(Icons.check_circle_rounded),
                  label: Text(
                    _isSubmitting ? 'Đang gửi...' : 'Gửi Xác Nhận An Toàn',
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
      ),
    );
  }

  Widget _buildAspectStarRow({
    required String label,
    required int value,
    required ValueChanged<int> onChanged,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Text(
            label,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: ColorConstants.textPrimary,
            ),
          ),
        ),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: List.generate(5, (index) {
            final starIndex = index + 1;
            return InkWell(
              onTap: () => onChanged(starIndex),
              borderRadius: BorderRadius.circular(20),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 2, vertical: 2),
                child: Icon(
                  starIndex <= value ? Icons.star_rounded : Icons.star_outline_rounded,
                  color: Colors.amber.shade600,
                  size: 26,
                ),
              ),
            );
          }),
        ),
      ],
    );
  }

  Widget _buildHealthChip({
    required String label,
    required String value,
    required Color color,
  }) {
    final isSelected = _selectedHealthStatus == value;
    return ChoiceChip(
      label: Text(
        label,
        style: TextStyle(
          color: isSelected ? Colors.white : ColorConstants.textPrimary,
          fontSize: 12,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        ),
      ),
      selected: isSelected,
      selectedColor: color,
      backgroundColor: ColorConstants.bgCanvas,
      side: BorderSide(color: isSelected ? color : ColorConstants.border),
      onSelected: (selected) {
        if (selected) {
          setState(() => _selectedHealthStatus = value);
        }
      },
    );
  }
}
