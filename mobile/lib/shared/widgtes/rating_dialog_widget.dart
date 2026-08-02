import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:mobile/core/constants/color_constants.dart';
import 'package:mobile/core/di/di.dart';
import 'package:mobile/core/utils/app_snackbar.dart';
import 'package:mobile/features/rating/data/rating_repository.dart';

class RatingDialogWidget extends StatefulWidget {
  final String sosRequestId;
  final String? rescuerName;
  final VoidCallback? onSubmitted;
  final Map<String, dynamic>? existingRating;
  final bool readOnly;
  final bool isCancelledRescue;
  final String? cancelReason;

  const RatingDialogWidget({
    super.key,
    required this.sosRequestId,
    this.rescuerName,
    this.onSubmitted,
    this.existingRating,
    this.readOnly = false,
    this.isCancelledRescue = false,
    this.cancelReason,
  });

  static Future<void> show(
    BuildContext context, {
    required String sosRequestId,
    String? rescuerName,
    VoidCallback? onSubmitted,
    Map<String, dynamic>? existingRating,
    bool readOnly = false,
    bool isCancelledRescue = false,
    String? cancelReason,
  }) {
    return showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => RatingDialogWidget(
        sosRequestId: sosRequestId,
        rescuerName: rescuerName,
        onSubmitted: onSubmitted,
        existingRating: existingRating,
        readOnly: readOnly,
        isCancelledRescue: isCancelledRescue,
        cancelReason: cancelReason,
      ),
    );
  }

  @override
  State<RatingDialogWidget> createState() => _RatingDialogWidgetState();
}

class _RatingDialogWidgetState extends State<RatingDialogWidget> {
  int _selectedRating = 5;
  int _responseSpeed = 5;
  int _attitude = 5;
  int _supportLevel = 5;
  bool _cancelledUnreasonably = false;
  final TextEditingController _commentController = TextEditingController();
  bool _isSubmitting = false;
  String? _errorMessage;

  bool get _isReadOnly => widget.readOnly || widget.existingRating != null;

  @override
  void initState() {
    super.initState();
    final ratingValue = widget.existingRating?['rating'] ?? widget.existingRating?['score'];
    final commentValue = widget.existingRating?['comment'] ?? widget.existingRating?['review_comment'];
    final responseSpeed = widget.existingRating?['response_speed'] ?? widget.existingRating?['responseSpeed'];
    final attitude = widget.existingRating?['attitude'];
    final supportLevel = widget.existingRating?['support_level'] ?? widget.existingRating?['supportLevel'];

    if (ratingValue is num) {
      _selectedRating = ratingValue.toInt().clamp(1, 5);
    } else if (ratingValue is String) {
      final parsed = int.tryParse(ratingValue);
      if (parsed != null) {
        _selectedRating = parsed.clamp(1, 5);
      }
    }

    _responseSpeed = _parseAspect(responseSpeed);
    _attitude = _parseAspect(attitude);
    _supportLevel = _parseAspect(supportLevel);

    final unreasonably =
        widget.existingRating?['cancelled_unreasonably'] ?? widget.existingRating?['cancelledUnreasonably'];
    if (unreasonably is bool) {
      _cancelledUnreasonably = unreasonably;
    } else if (unreasonably != null) {
      _cancelledUnreasonably = unreasonably.toString() == 'true';
    }

    if (commentValue != null) {
      _commentController.text = commentValue.toString();
    }
  }

  int _parseAspect(dynamic value) {
    if (value is num) return value.toInt().clamp(1, 5);
    if (value is String) {
      final parsed = int.tryParse(value);
      if (parsed != null) return parsed.clamp(1, 5);
    }
    return 5;
  }

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _submitRating() async {
    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    try {
      final ratingRepository = getIt<RatingRepository>();
      final result = await ratingRepository.submitRating(
        sosRequestId: widget.sosRequestId,
        rating: _selectedRating,
        responseSpeed: _responseSpeed,
        attitude: _attitude,
        supportLevel: _supportLevel,
        comment: _commentController.text.trim(),
        cancelledUnreasonably: _cancelledUnreasonably,
      );

      if (mounted) {
        if (result != null && (result['success'] == true || result['rating_id'] != null || result['data'] != null)) {
          AppSnackBar.show(
            context,
            'Đánh giá ca cứu hộ thành công. Cảm ơn bạn!',
            type: AppSnackBarType.success,
          );
          Navigator.of(context).pop();
          if (widget.onSubmitted != null) {
            widget.onSubmitted!();
          }
        } else {
          setState(() {
            _errorMessage = result?['message'] ?? 'Có lỗi xảy ra khi gửi đánh giá';
          });
        }
      }
    } catch (e) {
      if (mounted) {
        String msg = 'Không thể gửi đánh giá. Vui lòng thử lại sau.';
        if (e is DioException && e.response?.data != null) {
          msg = e.response?.data['message'] ?? msg;
        }
        setState(() {
          _errorMessage = msg;
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final rescuerText = widget.rescuerName != null && widget.rescuerName!.isNotEmpty
        ? 'cho ${widget.rescuerName}'
        : 'cho Cứu hộ viên';

    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      title: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: _isReadOnly ? ColorConstants.bgCanvas : Colors.amber.shade100,
              shape: BoxShape.circle,
            ),
            child: Icon(
              _isReadOnly ? Icons.star_rate_rounded : Icons.star_rounded,
              color: _isReadOnly ? ColorConstants.textSecondary : Colors.amber,
              size: 36,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            _isReadOnly ? 'Chi tiết đánh giá cứu hộ' : 'Đánh giá chất lượng cứu hộ',
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 4),
          Text(
            _isReadOnly
                ? 'Bạn đã gửi đánh giá cho ca cứu hộ này'
                : 'Hãy để lại trải nghiệm của bạn $rescuerText',
            style: TextStyle(fontSize: 13, color: ColorConstants.textSecondary),
            textAlign: TextAlign.center,
          ),
        ],
      ),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(5, (index) {
                final starValue = index + 1;
                final isSelected = starValue <= _selectedRating;
                return IconButton(
                  onPressed: _isSubmitting || _isReadOnly
                      ? null
                      : () {
                          setState(() {
                            _selectedRating = starValue;
                          });
                        },
                  icon: Icon(
                    isSelected ? Icons.star_rounded : Icons.star_outline_rounded,
                    color: isSelected
                        ? (_isReadOnly ? ColorConstants.textSecondary : Colors.amber)
                        : ColorConstants.textSecondary,
                    size: 38,
                  ),
                );
              }),
            ),
            const SizedBox(height: 8),
            Text(
              _getRatingLabel(_selectedRating),
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: _isReadOnly ? ColorConstants.textSecondary : Colors.amber.shade800,
                fontSize: 15,
              ),
            ),
            const SizedBox(height: 12),
            if (widget.isCancelledRescue && !_isReadOnly) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.orange.shade50,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.orange.shade200),
                ),
                child: Text(
                  '⚠️ Ca cứu hộ đã bị Cứu hộ viên hủy bỏ.'
                  '${widget.cancelReason != null && widget.cancelReason!.isNotEmpty ? '\nLý do: ${widget.cancelReason}' : ''}',
                  style: const TextStyle(fontSize: 12, color: Colors.deepOrange),
                ),
              ),
              const SizedBox(height: 8),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: ColorConstants.bgCanvas,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  children: [
                    Checkbox(
                      value: _cancelledUnreasonably,
                      onChanged: _isSubmitting ? null : (v) => setState(() => _cancelledUnreasonably = v ?? false),
                    ),
                    const Expanded(
                      child: Text(
                        'Lý do hủy không thỏa đáng (sẽ áp dụng phạt cho cứu hộ viên)',
                        style: TextStyle(fontSize: 12.5, color: Colors.black87),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
            ],
            _buildAspectRow(
              label: '⚡ Tốc độ phản ứng',
              value: _responseSpeed,
              onChanged: _isSubmitting || _isReadOnly ? null : (v) => setState(() => _responseSpeed = v),
            ),
            const SizedBox(height: 6),
            _buildAspectRow(
              label: '🤝 Thái độ phục vụ',
              value: _attitude,
              onChanged: _isSubmitting || _isReadOnly ? null : (v) => setState(() => _attitude = v),
            ),
            const SizedBox(height: 6),
            _buildAspectRow(
              label: '🛟 Mức độ hỗ trợ',
              value: _supportLevel,
              onChanged: _isSubmitting || _isReadOnly ? null : (v) => setState(() => _supportLevel = v),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _commentController,
              enabled: !_isSubmitting && !_isReadOnly,
              maxLines: 3,
              readOnly: _isReadOnly,
              decoration: InputDecoration(
                hintText: 'Nhận xét về thái độ, thời gian có mặt... (không bắt buộc)',
                hintStyle: TextStyle(fontSize: 13, color: ColorConstants.textSecondary),
                filled: true,
                fillColor: _isReadOnly ? ColorConstants.bgCanvas : ColorConstants.bgCanvas,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.all(12),
              ),
            ),
            if (_errorMessage != null) ...[
              const SizedBox(height: 10),
              Text(
                _errorMessage!,
                style: const TextStyle(color: Colors.red, fontSize: 12),
                textAlign: TextAlign.center,
              ),
            ],
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: _isSubmitting ? null : () => Navigator.of(context).pop(),
          child: Text(_isReadOnly ? 'Đóng' : 'Để sau', style: TextStyle(color: ColorConstants.textSecondary)),
        ),
        if (!_isReadOnly)
          ElevatedButton(
            onPressed: _isSubmitting ? null : _submitRating,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.amber.shade700,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            ),
            child: _isSubmitting
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                  )
                : const Text('Gửi đánh giá', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
      ],
    );
  }

  Widget _buildAspectRow({
    required String label,
    required int value,
    ValueChanged<int>? onChanged,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Text(
            label,
            style: TextStyle(
              fontSize: 12.5,
              fontWeight: FontWeight.w600,
              color: ColorConstants.textSecondary,
            ),
          ),
        ),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: List.generate(5, (index) {
            final starIndex = index + 1;
            return InkWell(
              onTap: onChanged == null ? null : () => onChanged(starIndex),
              borderRadius: BorderRadius.circular(20),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 2, vertical: 2),
                child: Icon(
                  starIndex <= value ? Icons.star_rounded : Icons.star_outline_rounded,
                  color: _isReadOnly ? ColorConstants.textSecondary : Colors.amber,
                  size: 24,
                ),
              ),
            );
          }),
        ),
      ],
    );
  }

  String _getRatingLabel(int rating) {
    switch (rating) {
      case 1:
        return 'Rất không hài lòng (1/5)';
      case 2:
        return 'Không hài lòng (2/5)';
      case 3:
        return 'Bình thường (3/5)';
      case 4:
        return 'Hài lòng (4/5)';
      case 5:
        return 'Rất tuyệt vời (5/5)';
      default:
        return '';
    }
  }
}