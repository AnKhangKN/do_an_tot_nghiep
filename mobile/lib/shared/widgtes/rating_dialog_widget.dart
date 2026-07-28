import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:mobile/core/di/di.dart';
import 'package:mobile/features/rating/data/rating_repository.dart';

class RatingDialogWidget extends StatefulWidget {
  final String sosRequestId;
  final String? rescuerName;
  final VoidCallback? onSubmitted;
  final Map<String, dynamic>? existingRating;
  final bool readOnly;

  const RatingDialogWidget({
    super.key,
    required this.sosRequestId,
    this.rescuerName,
    this.onSubmitted,
    this.existingRating,
    this.readOnly = false,
  });

  static Future<void> show(
    BuildContext context, {
    required String sosRequestId,
    String? rescuerName,
    VoidCallback? onSubmitted,
    Map<String, dynamic>? existingRating,
    bool readOnly = false,
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
      ),
    );
  }

  @override
  State<RatingDialogWidget> createState() => _RatingDialogWidgetState();
}

class _RatingDialogWidgetState extends State<RatingDialogWidget> {
  int _selectedRating = 5;
  final TextEditingController _commentController = TextEditingController();
  bool _isSubmitting = false;
  String? _errorMessage;

  bool get _isReadOnly => widget.readOnly || widget.existingRating != null;

  @override
  void initState() {
    super.initState();
    final ratingValue = widget.existingRating?['rating'] ?? widget.existingRating?['score'];
    final commentValue = widget.existingRating?['comment'] ?? widget.existingRating?['review_comment'];

    if (ratingValue is num) {
      _selectedRating = ratingValue.toInt().clamp(1, 5);
    } else if (ratingValue is String) {
      final parsed = int.tryParse(ratingValue);
      if (parsed != null) {
        _selectedRating = parsed.clamp(1, 5);
      }
    }

    if (commentValue != null) {
      _commentController.text = commentValue.toString();
    }
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
        comment: _commentController.text.trim(),
      );

      if (mounted) {
        if (result != null && (result['success'] == true || result['rating_id'] != null || result['data'] != null)) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Đánh giá ca cứu hộ thành công. Cảm ơn bạn!'),
              backgroundColor: Colors.green,
            ),
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
              color: _isReadOnly ? Colors.grey.shade200 : Colors.amber.shade100,
              shape: BoxShape.circle,
            ),
            child: Icon(
              _isReadOnly ? Icons.star_rate_rounded : Icons.star_rounded,
              color: _isReadOnly ? Colors.grey.shade600 : Colors.amber,
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
            style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
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
                        ? (_isReadOnly ? Colors.grey.shade600 : Colors.amber)
                        : Colors.grey.shade400,
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
                color: _isReadOnly ? Colors.grey.shade700 : Colors.amber.shade800,
                fontSize: 15,
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _commentController,
              enabled: !_isSubmitting && !_isReadOnly,
              maxLines: 3,
              readOnly: _isReadOnly,
              decoration: InputDecoration(
                hintText: 'Nhận xét về thái độ, thời gian có mặt... (không bắt buộc)',
                hintStyle: TextStyle(fontSize: 13, color: Colors.grey.shade400),
                filled: true,
                fillColor: _isReadOnly ? Colors.grey.shade100 : Colors.grey.shade100,
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
          child: Text(_isReadOnly ? 'Đóng' : 'Để sau', style: const TextStyle(color: Colors.grey)),
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