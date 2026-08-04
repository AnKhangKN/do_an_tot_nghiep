import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../core/constants/color_constants.dart';
import '../../../../core/utils/app_snackbar.dart';
import '../../../../shared/widgtes/image_picker_helper.dart';
import '../providers/user_provider.dart';
import '../widgets/avatar_picker_widget.dart';

class ProfileDetailScreen extends StatefulWidget {
  const ProfileDetailScreen({super.key});

  @override
  State<ProfileDetailScreen> createState() => _ProfileDetailScreenState();
}

class _ProfileDetailScreenState extends State<ProfileDetailScreen> {
  late TextEditingController _fullNameController;
  late TextEditingController _phoneController;
  late TextEditingController _emailController;
  final _formKey = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();
    final user = context.read<UserProvider>().user;
    _fullNameController = TextEditingController(text: user?.fullName ?? '');
    _phoneController = TextEditingController(text: user?.phone ?? '');
    _emailController = TextEditingController(text: user?.email ?? '');
  }

  @override
  void dispose() {
    _fullNameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _pickAndUploadAvatar() async {
    final image = await ImagePickerHelper.pickImage(context);
    if (image == null) return;
    if (!mounted) return;

    final userProvider = context.read<UserProvider>();
    final success = await userProvider.updateAvatar(image.path);

    if (!mounted) return;
    AppSnackBar.show(
      context,
      success
          ? 'Cập nhật ảnh đại diện thành công!'
          : 'Cập nhật ảnh đại diện thất bại. Vui lòng thử lại!',
      type: success ? AppSnackBarType.success : AppSnackBarType.error,
    );
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;

    final userProvider = context.read<UserProvider>();

    try {
      final success = await userProvider.updateProfile(
        fullName: _fullNameController.text.trim(),
        phone: _phoneController.text.trim(),
      );

      if (!mounted) return;
      if (success) {
        AppSnackBar.show(
          context,
          'Cập nhật thông tin cá nhân thành công!',
          type: AppSnackBarType.success,
        );
      }
    } catch (e) {
      if (!mounted) return;
      String errorMsg = 'Cập nhật thông tin thất bại. Vui lòng thử lại!';
      if (e.toString().contains('Số điện thoại')) {
        errorMsg = 'Số điện thoại này đã được sử dụng bởi tài khoản khác!';
      }
      AppSnackBar.show(
        context,
        errorMsg,
        type: AppSnackBarType.error,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final userProvider = context.watch<UserProvider>();
    final user = userProvider.user;

    return Scaffold(
      resizeToAvoidBottomInset: true,
      backgroundColor: ColorConstants.backgroundLight,
      appBar: AppBar(
        title: const Text(
          'Thông tin cá nhân',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
        backgroundColor: ColorConstants.surfaceWhite,
        foregroundColor: ColorConstants.textPrimary,
        elevation: 0.5,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: [
            // Header Avatar
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
              decoration: BoxDecoration(
                color: ColorConstants.surfaceWhite,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.04),
                    blurRadius: 10,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                children: [
                  AvatarPickerWidget(
                    avatarUrl: user?.avatarUrl,
                    fullName: user?.fullName ?? "U",
                    isUploading: userProvider.uploadingAvatar,
                    onTap: _pickAndUploadAvatar,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    user?.fullName ?? '',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: ColorConstants.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        user?.email ?? '',
                        style: TextStyle(
                          fontSize: 13,
                          color: ColorConstants.textSecondary,
                        ),
                      ),
                      if (user?.isVerified == true) ...[
                        const SizedBox(width: 6),
                        const Icon(
                          Icons.verified,
                          color: Colors.blue,
                          size: 16,
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: ColorConstants.redRescue.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      user?.role == 'RESCUER' ? 'CỨU HỘ VIÊN' : 'NẠN NHÂN / NGƯỜI DÙNG',
                      style: TextStyle(
                        color: ColorConstants.redRescue,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Form Chỉnh sửa thông tin
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: ColorConstants.surfaceWhite,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.04),
                    blurRadius: 10,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'THÔNG TIN TÀI KHOẢN',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        color: ColorConstants.textSecondary,
                        letterSpacing: 1.1,
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Họ và tên
                    _buildTextField(
                      controller: _fullNameController,
                      label: 'Họ và tên',
                      icon: Icons.person_outline,
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Vui lòng nhập họ và tên!';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // Số điện thoại
                    _buildTextField(
                      controller: _phoneController,
                      label: 'Số điện thoại',
                      icon: Icons.phone_outlined,
                      keyboardType: TextInputType.phone,
                      validator: (value) {
                        if (value != null && value.trim().isNotEmpty) {
                          if (value.trim().length < 9) {
                            return 'Số điện thoại không hợp lệ!';
                          }
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // Email (Read-only)
                    _buildTextField(
                      controller: _emailController,
                      label: 'Địa chỉ Email (Không thể sửa)',
                      icon: Icons.email_outlined,
                      readOnly: true,
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 32),

            // Nút Lưu thay đổi
            SizedBox(
              width: double.infinity,
              height: 54,
              child: ElevatedButton(
                onPressed: userProvider.isUpdating ? null : _saveProfile,
                style: ElevatedButton.styleFrom(
                  backgroundColor: ColorConstants.redRescue,
                  foregroundColor: Colors.white,
                  elevation: 3,
                  shadowColor: ColorConstants.redRescue.withOpacity(0.4),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
                child: userProvider.isUpdating
                    ? const SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2.5,
                        ),
                      )
                    : const Text(
                        'LƯU THAY ĐỔI',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.5,
                        ),
                      ),
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    TextInputType keyboardType = TextInputType.text,
    bool readOnly = false,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      readOnly: readOnly,
      keyboardType: keyboardType,
      validator: validator,
      style: TextStyle(
        fontSize: 15,
        color: readOnly ? ColorConstants.textSecondary : ColorConstants.textPrimary,
        fontWeight: FontWeight.w500,
      ),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: TextStyle(color: ColorConstants.textSecondary, fontSize: 13),
        prefixIcon: Icon(icon, color: readOnly ? ColorConstants.textSecondary : ColorConstants.redRescue, size: 22),
        filled: true,
        fillColor: readOnly ? ColorConstants.backgroundLight : ColorConstants.backgroundLight,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: ColorConstants.borderDark),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: ColorConstants.borderDark),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: ColorConstants.redRescue, width: 1.5),
        ),
      ),
    );
  }
}
