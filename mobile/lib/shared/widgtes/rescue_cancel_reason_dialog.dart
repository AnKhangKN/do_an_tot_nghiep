import 'package:flutter/material.dart';
import 'package:mobile/core/constants/color_constants.dart';

/// Dialog chọn lý do khi Cứu hộ viên hủy ca cứu hộ đang thực hiện.
/// Trả về `String` lý do đã chọn (hoặc null nếu người dùng quay lại).
class RescueCancelReasonDialog {
  static const List<String> _presetReasons = [
    'Sai thông tin nạn nhân / địa chỉ',
    'Không tiếp cận được nạn nhân',
    'Vị trí quá xa / không kịp thời gian',
    'Đang xử lý tình huống khẩn cấp khác',
    'Lý do khác',
  ];

  static Future<String?> show(BuildContext context) {
    return showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const _RescueCancelReasonSheet(),
    );
  }

  static String _buildReason({required String preset, String note = ''}) {
    final noteTrimmed = note.trim();
    if (preset == 'Lý do khác') {
      return noteTrimmed.isEmpty ? 'Lý do khác' : noteTrimmed;
    }
    return noteTrimmed.isEmpty ? preset : '$preset ($noteTrimmed)';
  }
}

class _RescueCancelReasonSheet extends StatefulWidget {
  const _RescueCancelReasonSheet();

  @override
  State<_RescueCancelReasonSheet> createState() =>
      _RescueCancelReasonSheetState();
}

class _RescueCancelReasonSheetState extends State<_RescueCancelReasonSheet> {
  String? _selected;
  final TextEditingController _noteController = TextEditingController();

  @override
  void dispose() {
    _noteController.dispose();
    super.dispose();
  }

  String? _validate() {
    final preset = _selected;
    if (preset == null) {
      return 'Vui lòng chọn một lý do hủy ca cứu hộ';
    }
    if (preset == 'Lý do khác' && _noteController.text.trim().isEmpty) {
      return 'Vui lòng nhập lý do cụ thể khi chọn "Lý do khác"';
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final viewInsets = MediaQuery.of(context).viewInsets.bottom;
    return Material(
      color: ColorConstants.surfaceWhite,
      borderRadius: const BorderRadius.only(
        topLeft: Radius.circular(24),
        topRight: Radius.circular(24),
      ),
      clipBehavior: Clip.antiAlias,
      child: ConstrainedBox(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.of(context).size.height * 0.8,
        ),
        child: SafeArea(
          child: Padding(
            padding: EdgeInsets.fromLTRB(20, 18, 20, 16 + viewInsets),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.error_outline, color: ColorConstants.danger),
                    SizedBox(width: 8),
                    Text(
                      'Hủy ca cứu hộ',
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                        color: ColorConstants.danger,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  'Vui lòng chọn lý do hủy. Hủy ca liên tiếp sẽ bị tạm khóa nhận ca cứu hộ mới: '
                  'lần 2 → 2 giờ, lần 4 → 12 giờ, lần 6 → 24 giờ, lần 8 → cấm vĩnh viễn.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 12,
                    color: ColorConstants.textMuted,
                  ),
                ),
                const SizedBox(height: 14),
                Flexible(
                  child: ListView.separated(
                    shrinkWrap: true,
                    itemCount: RescueCancelReasonDialog._presetReasons.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 4),
                    itemBuilder: (context, index) {
                      final reason =
                          RescueCancelReasonDialog._presetReasons[index];
                      return RadioListTile<String>(
                        value: reason,
                        groupValue: _selected,
                        onChanged: (value) => setState(() => _selected = value),
                        dense: true,
                        contentPadding: EdgeInsets.zero,
                        title: Text(
                          reason,
                          style: const TextStyle(fontSize: 14),
                        ),
                        activeColor: ColorConstants.danger,
                      );
                    },
                  ),
                ),
                if (_selected == 'Lý do khác') ...[
                  const SizedBox(height: 8),
                  TextField(
                    controller: _noteController,
                    maxLength: 200,
                    decoration: InputDecoration(
                      hintText: 'Nhập lý do cụ thể...',
                      hintStyle: TextStyle(
                        fontSize: 13,
                        color: ColorConstants.textMuted,
                      ),
                      filled: true,
                      fillColor: ColorConstants.bgCanvas,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 12,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: BorderSide(color: ColorConstants.border),
                      ),
                    ),
                  ),
                ],
                const SizedBox(height: 14),
                SizedBox(
                  height: 48,
                  child: ElevatedButton(
                    onPressed: () {
                      final error = _validate();
                      if (error != null) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(error),
                            backgroundColor: ColorConstants.danger,
                          ),
                        );
                        return;
                      }
                      final reason = RescueCancelReasonDialog._buildReason(
                        preset: _selected!,
                        note: _noteController.text,
                      );
                      Navigator.of(context).pop(reason);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: ColorConstants.danger,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    child: const Text(
                      'Xác nhận hủy ca cứu hộ',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('Quay lại', style: TextStyle(fontSize: 13)),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
