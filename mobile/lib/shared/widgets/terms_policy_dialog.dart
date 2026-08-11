import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:mobile/core/constants/app_constants.dart';
import '../../core/constants/color_constants.dart';

enum TermsPolicyType { terms, privacy }

class TermsPolicyDialog extends StatefulWidget {
  final TermsPolicyType type;

  const TermsPolicyDialog({super.key, required this.type});

  static void show(BuildContext context, TermsPolicyType type) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => TermsPolicyDialog(type: type),
    );
  }

  @override
  State<TermsPolicyDialog> createState() => _TermsPolicyDialogState();
}

class _TermsPolicyDialogState extends State<TermsPolicyDialog> {
  String? _dynamicContent;
  bool _isLoading = true;

  static const String _defaultTerms = '''
1. Quyền và Trách nhiệm Người dùng:
- Người dùng chịu trách nhiệm về tính chính xác của các tín hiệu SOS phát ra.
- Nghiêm cấm hành vi phát tín hiệu SOS giả hoặc tạo điểm cảnh báo giả làm sai lệch dữ liệu cứu hộ.

2. Quyền riêng tư & Vị trí:
- Ứng dụng thu thập dữ liệu vị trí GPS khi bạn kích hoạt tín hiệu SOS hoặc chế độ cứu hộ ngầm nhằm mục đích chỉ đường cho Đội cứu hộ.
- Dữ liệu vị trí được bảo mật tuyệt đối và chỉ chia sẻ cho Cứu hộ viên trong thời gian xử lý sự cố.

3. Giới hạn trách nhiệm:
- Hệ thống hỗ trợ tối đa việc kết nối cứu hộ thời gian thực nhưng không thay thế hoàn toàn cho các cơ quan chức năng nhà nước (113, 114, 115).
  ''';

  static const String _defaultPrivacy = '''
1. Dữ liệu chúng tôi thu thập:
- Thông tin tài khoản: Họ tên, Số điện thoại, Email và Ảnh đại diện.
- Dữ liệu vị trí GPS thời gian thực khi sử dụng tính năng cứu hộ hoặc báo cáo cảnh báo.

2. Mục đích sử dụng dữ liệu:
- Tìm kiếm và kết nối Nạn nhân với Cứu hộ viên gần nhất.
- Phát cảnh báo vùng nguy hiểm cho người dùng trong bán kính nguy cơ.

3. Cam kết bảo mật:
- Mọi thông tin cá nhân đều được mã hóa và bảo vệ theo tiêu chuẩn an toàn thông tin. Chúng tôi cam kết không bán hoặc chia sẻ dữ liệu cho bên thứ ba vì mục đích thương mại.
  ''';

  @override
  void initState() {
    super.initState();
    _fetchPolicy();
  }

  Future<void> _fetchPolicy() async {
    try {
      final cleanDio = Dio(BaseOptions(
        baseUrl: AppConstants.baseUrl,
        connectTimeout: const Duration(seconds: 5),
        receiveTimeout: const Duration(seconds: 5),
      ));
      final res = await cleanDio.get('/api/public/settings/thesis-info');
      if (res.data != null) {
        final responseBody = res.data;
        final payload = (responseBody is Map && responseBody['data'] is Map)
            ? responseBody['data']
            : responseBody;
        final key = widget.type == TermsPolicyType.terms
            ? 'terms_of_service_content'
            : 'privacy_policy_content';
        final val = payload[key];
        if (val != null && val.toString().trim().isNotEmpty) {
          if (mounted) {
            setState(() {
              _dynamicContent = val.toString();
              _isLoading = false;
            });
            return;
          }
        }
      }
    } catch (_) {
      // Fallback silently if offline or API error
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isTerms = widget.type == TermsPolicyType.terms;
    final title = isTerms ? 'Điều khoản sử dụng' : 'Chính sách bảo mật';
    final fallbackContent = isTerms ? _defaultTerms : _defaultPrivacy;
    final displayContent = (_dynamicContent != null && _dynamicContent!.trim().isNotEmpty)
        ? _dynamicContent!
        : fallbackContent;

    return Container(
      decoration: BoxDecoration(
        color: ColorConstants.surfaceWhite,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: ColorConstants.borderDark,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            title,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: ColorConstants.textPrimary,
            ),
          ),
          const Divider(height: 24),
          ConstrainedBox(
            constraints: BoxConstraints(
              maxHeight: MediaQuery.of(context).size.height * 0.5,
            ),
            child: _isLoading
                ? const Center(
                    child: Padding(
                      padding: EdgeInsets.all(24.0),
                      child: CircularProgressIndicator(color: ColorConstants.redRescue),
                    ),
                  )
                : SingleChildScrollView(
                    child: Text(
                      displayContent.trim(),
                      style: TextStyle(
                        fontSize: 14,
                        color: ColorConstants.textSecondary,
                        height: 1.5,
                      ),
                    ),
                  ),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: ColorConstants.redRescue,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text(
                'Đã hiểu',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
