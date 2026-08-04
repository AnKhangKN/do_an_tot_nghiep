import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../../core/constants/color_constants.dart';
import '../../../../core/constants/router_constants.dart';
import '../../../../core/utils/app_snackbar.dart';
import '../providers/app_report_provider.dart';
import '../widgets/app_report_badges.dart';

class AppReportScreen extends StatefulWidget {
  const AppReportScreen({super.key});

  @override
  State<AppReportScreen> createState() => _AppReportScreenState();
}

class _AppReportScreenState extends State<AppReportScreen> {
  final _titleController = TextEditingController();
  final _contentController = TextEditingController();

  String _selectedCategory = 'BUG';
  String? _validationError;

  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final title = _titleController.text.trim();
    final content = _contentController.text.trim();

    if (title.length < 5) {
      setState(() => _validationError = 'Tiêu đề báo cáo phải từ 5 ký tự trở lên!');
      return;
    }
    if (content.length < 10) {
      setState(() => _validationError = 'Nội dung báo cáo phải từ 10 ký tự trở lên!');
      return;
    }

    setState(() => _validationError = null);

    final provider = context.read<AppReportProvider>();
    final success = await provider.submitReport(
      category: _selectedCategory,
      title: title,
      content: content,
    );

    if (!mounted) return;

    if (success) {
      _titleController.clear();
      _contentController.clear();
      setState(() => _selectedCategory = 'BUG');
      context.push(RouterConstants.appReportHistory);
    } else {
      AppSnackBar.show(
        context,
        provider.submitError ?? 'Gửi báo cáo thất bại. Vui lòng thử lại!',
        type: AppSnackBarType.error,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AppReportProvider>();
    final isSubmitting = provider.isSubmitting;

    return Scaffold(
      backgroundColor: ColorConstants.backgroundLight,
      appBar: AppBar(
        title: const Text(
          'Báo cáo ứng dụng',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
        backgroundColor: ColorConstants.surfaceWhite,
        foregroundColor: ColorConstants.textPrimary,
        elevation: 0.5,
        actions: [
          IconButton(
            tooltip: 'Lịch sử báo cáo',
            onPressed: () => context.push(RouterConstants.appReportHistory),
            icon: const Icon(Icons.history_rounded),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: ColorConstants.redRescue.withOpacity(0.08),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: ColorConstants.redRescue.withOpacity(0.2)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: ColorConstants.redRescue,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.flag_outlined,
                    color: Colors.white,
                    size: 22,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Báo cáo lỗi, góp ý hoặc các vấn đề gặp phải khi sử dụng ứng dụng. Phản hồi của bạn sẽ giúp chúng tôi cải thiện dịch vụ tốt hơn.',
                    style: TextStyle(
                      fontSize: 13,
                      height: 1.4,
                      color: ColorConstants.textPrimary,
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          _buildSectionLabel('DANH MỤC BÁO CÁO *'),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: ['BUG', 'SUGGESTION', 'CONTENT', 'OTHER'].map((category) {
              return AppReportCategoryChip(
                category: category,
                selected: _selectedCategory == category,
                onTap: () => setState(() => _selectedCategory = category),
              );
            }).toList(),
          ),

          const SizedBox(height: 24),

          _buildSectionLabel('TIÊU ĐỀ *'),
          TextField(
            controller: _titleController,
            maxLength: 200,
            textInputAction: TextInputAction.next,
            style: const TextStyle(fontSize: 14),
            decoration: _inputDecoration(
              hint: 'Tóm tắt ngắn gọn vấn đề bạn gặp phải',
            ),
          ),

          const SizedBox(height: 16),

          _buildSectionLabel('NỘI DUNG CHI TIẾT *'),
          TextField(
            controller: _contentController,
            maxLines: 7,
            maxLength: 5000,
            style: const TextStyle(fontSize: 14, height: 1.4),
            decoration: _inputDecoration(
              hint: 'Mô tả chi tiết lỗi, góp ý hoặc vấn đề của bạn...',
              alignLabelWithHint: true,
            ),
          ),

          if (_validationError != null) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: ColorConstants.dangerLight,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: ColorConstants.dangerBorder),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.warning_amber_rounded,
                    size: 18,
                    color: ColorConstants.dangerText,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _validationError!,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: ColorConstants.dangerText,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],

          const SizedBox(height: 24),

          SizedBox(
            height: 56,
            child: ElevatedButton.icon(
              onPressed: isSubmitting ? null : _submit,
              icon: isSubmitting
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.5,
                        color: Colors.white,
                      ),
                    )
                  : const Icon(Icons.send_rounded, color: Colors.white),
              label: Text(
                isSubmitting ? 'ĐANG GỬI...' : 'GỬI BÁO CÁO',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.5,
                ),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: ColorConstants.redRescue,
                foregroundColor: Colors.white,
                disabledBackgroundColor: ColorConstants.redRescue.withOpacity(0.6),
                elevation: 4,
                shadowColor: ColorConstants.redRescue.withOpacity(0.5),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
            ),
          ),

          const SizedBox(height: 16),

          TextButton.icon(
            onPressed: () => context.push(RouterConstants.appReportHistory),
            icon: Icon(
              Icons.history_rounded,
              size: 18,
              color: ColorConstants.textSecondary,
            ),
            label: Text(
              'Xem lịch sử báo cáo của tôi',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: ColorConstants.textSecondary,
              ),
            ),
          ),

          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildSectionLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w800,
          color: ColorConstants.textSecondary,
          letterSpacing: 1.1,
        ),
      ),
    );
  }

  InputDecoration _inputDecoration({
    required String hint,
    bool alignLabelWithHint = false,
  }) {
    return InputDecoration(
      hintText: hint,
      hintStyle: TextStyle(color: ColorConstants.textMuted, fontSize: 13),
      filled: true,
      fillColor: ColorConstants.surfaceWhite,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide(color: ColorConstants.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide(color: ColorConstants.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: ColorConstants.redRescue, width: 1.6),
      ),
      alignLabelWithHint: alignLabelWithHint,
    );
  }
}
