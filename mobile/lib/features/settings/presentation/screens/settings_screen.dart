import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../core/constants/color_constants.dart';
import '../../../../core/di/di.dart';
import '../../../../core/theme/theme_controller.dart';
import '../../../../core/utils/app_snackbar.dart';
import '../providers/settings_provider.dart';

import '../../../../shared/widgtes/keyboard_safe_sheet.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {

  void _showChangePasswordDialog() {
    final oldPasswordController = TextEditingController();
    final newPasswordController = TextEditingController();
    final confirmPasswordController = TextEditingController();
    final formKey = GlobalKey<FormState>();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (dialogContext) {
        final bottomInset = MediaQuery.of(dialogContext).viewInsets.bottom;

        return KeyboardSafeSheet(
          child: Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: ColorConstants.surfaceWhite,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: Form(
              key: formKey,
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: EdgeInsets.only(bottom: bottomInset),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Handle
                    Center(
                      child: Container(
                        width: 40,
                        height: 4,
                        margin: const EdgeInsets.only(bottom: 14),
                        decoration: BoxDecoration(
                          color: ColorConstants.borderDark,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),

                    // Header
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: ColorConstants.redRescue.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: const Icon(
                            Icons.lock_outline_rounded,
                            color: ColorConstants.redRescue,
                            size: 24,
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Đổi mật khẩu',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: ColorConstants.textPrimary,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                'Cập nhật mật khẩu bảo mật tài khoản của bạn',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: ColorConstants.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Divider(height: 1, color: ColorConstants.divider),
                    const SizedBox(height: 16),

                    TextFormField(
                      controller: oldPasswordController,
                      obscureText: true,
                      decoration: InputDecoration(
                        labelText: 'Mật khẩu hiện tại',
                        prefixIcon: const Icon(Icons.key_outlined),
                        filled: true,
                        fillColor: ColorConstants.bgCanvas,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: BorderSide(color: ColorConstants.border),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: BorderSide(color: ColorConstants.border),
                        ),
                      ),
                      validator: (val) =>
                          val == null || val.isEmpty ? 'Vui lòng nhập mật khẩu hiện tại' : null,
                    ),
                    const SizedBox(height: 14),
                    TextFormField(
                      controller: newPasswordController,
                      obscureText: true,
                      decoration: InputDecoration(
                        labelText: 'Mật khẩu mới',
                        prefixIcon: const Icon(Icons.lock_clock_outlined),
                        filled: true,
                        fillColor: ColorConstants.bgCanvas,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: BorderSide(color: ColorConstants.border),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: BorderSide(color: ColorConstants.border),
                        ),
                      ),
                      validator: (val) {
                        if (val == null || val.isEmpty) return 'Vui lòng nhập mật khẩu mới';
                        if (val.length < 6) return 'Mật khẩu phải từ 6 ký tự trở lên';
                        return null;
                      },
                    ),
                    const SizedBox(height: 14),
                    TextFormField(
                      controller: confirmPasswordController,
                      obscureText: true,
                      decoration: InputDecoration(
                        labelText: 'Xác nhận mật khẩu mới',
                        prefixIcon: const Icon(Icons.check_circle_outline),
                        filled: true,
                        fillColor: ColorConstants.bgCanvas,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: BorderSide(color: ColorConstants.border),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: BorderSide(color: ColorConstants.border),
                        ),
                      ),
                      validator: (val) {
                        if (val != newPasswordController.text) {
                          return 'Mật khẩu xác nhận không khớp!';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 24),
                    Row(
                      children: [
                        Expanded(
                          child: TextButton(
                            onPressed: () => Navigator.pop(dialogContext),
                            style: TextButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 14),
                            ),
                            child: Text(
                              'HỦY',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: ColorConstants.textSecondary,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: ColorConstants.redRescue,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                            ),
                            onPressed: () {
                              if (formKey.currentState!.validate()) {
                                Navigator.pop(dialogContext);
                                AppSnackBar.show(
                                  context,
                                  'Đổi mật khẩu thành công!',
                                  type: AppSnackBarType.success,
                                );
                              }
                            },
                            child: const Text(
                              'CẬP NHẬT',
                              style: TextStyle(fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ColorConstants.backgroundLight,
      appBar: AppBar(
        title: const Text(
          'Cấu hình ứng dụng',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
        backgroundColor: ColorConstants.surfaceWhite,
        foregroundColor: ColorConstants.textPrimary,
        elevation: 0.5,
      ),
      body: Consumer<SettingsProvider>(
        builder: (context, settings, child) {
          return ListView(
            padding: const EdgeInsets.all(16.0),
            children: [
              // Section: Giao diện
              _buildSectionHeader('GIAO DIỆN & HIỂN THỊ'),
              Container(
                decoration: BoxDecoration(
                  color: ColorConstants.surfaceWhite,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.03),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                padding: const EdgeInsets.all(16),
                child: ListenableBuilder(
                  listenable: getIt<ThemeController>(),
                  builder: (context, _) {
                    final controller = getIt<ThemeController>();
                    return Row(
                      children: AppThemeMode.values.map((mode) {
                        final selected = controller.mode == mode;
                        final IconData icon;
                        final String label;
                        switch (mode) {
                          case AppThemeMode.system:
                            icon = Icons.brightness_auto_rounded;
                            label = 'Tự động';
                            break;
                          case AppThemeMode.light:
                            icon = Icons.light_mode_rounded;
                            label = 'Sáng';
                            break;
                          case AppThemeMode.dark:
                            icon = Icons.dark_mode_rounded;
                            label = 'Tối';
                            break;
                        }
                        return Expanded(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 4),
                            child: Material(
                              color: selected ? ColorConstants.redRescue : Colors.transparent,
                              borderRadius: BorderRadius.circular(12),
                              child: InkWell(
                                borderRadius: BorderRadius.circular(12),
                                onTap: () => controller.setMode(mode),
                                child: Padding(
                                  padding: const EdgeInsets.symmetric(vertical: 10),
                                  child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(
                                        icon,
                                        size: 20,
                                        color: selected ? Colors.white : ColorConstants.textSecondary,
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        label,
                                        style: TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w600,
                                          color: selected ? Colors.white : ColorConstants.textSecondary,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    );
                  },
                ),
              ),

              const SizedBox(height: 24),

              // Section: Cảnh báo vùng nguy hiểm
              _buildSectionHeader('CẢI ĐẶT CẢNH BÁO'),
              _buildCardContainer([
                _buildSwitchTile(
                  icon: Icons.warning_amber_rounded,
                  title: 'Cảnh báo vùng nguy hiểm',
                  subtitle: 'Tự động hiển thị cảnh báo khi đi vào khu vực nguy hiểm',
                  value: settings.notifyHazard,
                  onChanged: (val) => settings.updateNotifyHazard(val),
                ),
              ]),

              const SizedBox(height: 24),

              // Section: Bảo mật
              _buildSectionHeader('BẢO MẬT TÀI KHOẢN'),
              _buildCardContainer([
                ListTile(
                  leading: const Icon(Icons.lock_outline, color: ColorConstants.redRescue),
                  title: const Text('Đổi mật khẩu', style: TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: const Text('Thay đổi mật khẩu đăng nhập tài khoản'),
                  trailing: const Icon(Icons.chevron_right, size: 20),
                  onTap: _showChangePasswordDialog,
                ),
              ]),

              const SizedBox(height: 32),
            ],
          );
        },
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8),
      child: Text(
        title,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w800,
          color: ColorConstants.textSecondary,
          letterSpacing: 1.1,
        ),
      ),
    );
  }

  Widget _buildCardContainer(List<Widget> children) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: ColorConstants.surfaceWhite,
        borderRadius: BorderRadius.circular(16),
        clipBehavior: Clip.antiAlias,
        child: Column(children: children),
      ),
    );
  }

  Widget _buildSwitchTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return SwitchListTile.adaptive(
      secondary: Icon(icon, color: ColorConstants.redRescue),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
      subtitle: Text(subtitle, style: TextStyle(color: ColorConstants.textSecondary, fontSize: 12)),
      value: value,
      activeColor: ColorConstants.success,
      onChanged: onChanged,
    );
  }
}
