import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';

import '../../../../core/constants/color_constants.dart';
import '../../../../core/constants/router_constants.dart';
import '../../../../core/di/di.dart';
import '../../../../core/theme/theme_controller.dart';
import '../../../../core/utils/app_snackbar.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../providers/user_provider.dart';
import '../widgets/avatar_picker_widget.dart';

import '../../../../shared/widgtes/image_picker_helper.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool isAvailable = true; // Giả lập trạng thái sẵn sàng cho cứu hộ viên

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      if (mounted) {
        context.read<UserProvider>().getProfile();
      }
    });
  }

  Future<void> _pickAndUploadAvatar() async {
    final XFile? image = await ImagePickerHelper.pickImage(context);

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


  @override
  Widget build(BuildContext context) {
    final userProvider = context.watch<UserProvider>();
    final user = userProvider.user;

    return Scaffold(
      backgroundColor: ColorConstants.backgroundLight,
      body: CustomScrollView(
        slivers: [
          // Header với hiệu ứng Sliver
          _buildSliverHeader(userProvider),

          SliverToBoxAdapter(
            child: RepaintBoundary(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                  // Thẻ trạng thái sẵn sàng (Tính năng đặc thù cứu hộ)
                  // _buildAvailabilityCard(),
                  
                  const SizedBox(height: 20),

                  // Thẻ chọn chế độ sáng/tối
                  _buildThemeCard(),
                  
                  const SizedBox(height: 20),

                  // Nhóm menu: Hoạt động
                  _buildMenuSection(
                    "Hoạt động cứu hộ & Đóng góp",
                    [
                      _menuItem(Icons.history, "Lịch sử hỗ trợ", RouterConstants.history),
                      _menuItem(Icons.warning_amber_rounded, "Điểm cảnh báo đã tạo", RouterConstants.myDangerousPoints),
                      _menuItem(Icons.medical_services_outlined, "Điểm tiện ích đã tạo", RouterConstants.myAmenities),
                      if (user?.role != 'RESCUER')
                        _menuItem(Icons.verified_user_outlined, "Đăng ký cứu hộ viên", RouterConstants.registerRescuer),
                    ],
                  ),

                  const SizedBox(height: 20),

                  // Nhóm menu: Tài khoản & Hệ thống
                  _buildMenuSection(
                    "Tài khoản & Hệ thống",
                    [
                      _menuItem(Icons.person_outline, "Thông tin cá nhân", RouterConstants.profileDetail),
                      _menuItem(Icons.settings_outlined, "Cấu hình ứng dụng", RouterConstants.setting),
                      _menuItem(Icons.help_outline, "Trung tâm trợ giúp", RouterConstants.helpCenter),
                      _menuItem(Icons.info_outline, "Thông tin ứng dụng", RouterConstants.appInfo),
                    ],
                  ),

                  const SizedBox(height: 32),

                  // Nút Đăng xuất
                  _logoutButton(context),
                  
                  const SizedBox(height: 40),
                ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSliverHeader(UserProvider userProvider) {
    final user = userProvider.user;
    final isUploading = userProvider.uploadingAvatar;

    return SliverAppBar(
      expandedHeight: 230,
      pinned: true,
      backgroundColor: ColorConstants.redRescue,
      flexibleSpace: FlexibleSpaceBar(
        background: RepaintBoundary(
          child: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [ColorConstants.redRescue, Color(0xFFC62828)],
            ),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const SizedBox(height: 40),
              AvatarPickerWidget(
                avatarUrl: user?.avatarUrl,
                fullName: user?.fullName ?? "U",
                isUploading: isUploading,
                onTap: _pickAndUploadAvatar,
              ),

              const SizedBox(height: 12),
              Text(
                user?.fullName ?? "Đang tải...",
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                ),
              ),

              Text(
                user?.email ?? "",
                style: const TextStyle(
                  color: Colors.white70,
                  fontSize: 14,
                ),
              ),
            ],
          ),
        ),
        ),
      ),
    );
  }

  // Widget _buildAvailabilityCard() {
  //   return Container(
  //     padding: const EdgeInsets.all(16),
  //     decoration: BoxDecoration(
  //       color: ColorConstants.surfaceWhite,
  //       borderRadius: BorderRadius.circular(16),
  //       boxShadow: [
  //         BoxShadow(
  //           color: Colors.black.withOpacity(0.05),
  //           blurRadius: 10,
  //           offset: const Offset(0, 4),
  //         ),
  //       ],
  //     ),
  //     child: Row(
  //       children: [
  //         Container(
  //           padding: const EdgeInsets.all(12),
  //           decoration: BoxDecoration(
  //             color: isAvailable ? ColorConstants.success.withOpacity(0.1) : ColorConstants.textSecondary.withOpacity(0.1),
  //             shape: BoxShape.circle,
  //           ),
  //           child: Icon(
  //             isAvailable ? Icons.gpp_good : Icons.gpp_maybe,
  //             color: isAvailable ? ColorConstants.success : ColorConstants.textSecondary,
  //             size: 28,
  //           ),
  //         ),
  //         const SizedBox(width: 16),
  //         Expanded(
  //           child: Column(
  //             crossAxisAlignment: CrossAxisAlignment.start,
  //             children: [
  //               const Text(
  //                 "Chế độ sẵn sàng",
  //                 style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17),
  //               ),
  //               Text(
  //                 isAvailable ? "Bạn đang sẵn sàng nhận cứu hộ" : "Bạn đang ở trạng thái ngoại tuyến",
  //                 style: TextStyle(color: ColorConstants.textSecondary, fontSize: 13),
  //               ),
  //             ],
  //           ),
  //         ),
  //         Switch.adaptive(
  //           value: isAvailable,
  //           activeColor: ColorConstants.success,
  //           onChanged: (val) {
  //             setState(() {
  //               isAvailable = val;
  //             });
  //           },
  //         ),
  //       ],
  //     ),
  //   );
  // }

  Widget _buildThemeCard() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 8),
          child: Text(
            "GIAO DIỆN",
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w800,
              color: ColorConstants.textSecondary,
              letterSpacing: 1.1,
            ),
          ),
        ),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: ColorConstants.surfaceWhite,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.02),
                blurRadius: 3,
                offset: const Offset(0, 1),
              ),
            ],
          ),
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
                      label = "Tự động";
                      break;
                    case AppThemeMode.light:
                      icon = Icons.light_mode_rounded;
                      label = "Sáng";
                      break;
                    case AppThemeMode.dark:
                      icon = Icons.dark_mode_rounded;
                      label = "Tối";
                      break;
                  }
                  return Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: Material(
                        color: selected
                            ? ColorConstants.redRescue
                            : Colors.transparent,
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
                                  color: selected
                                      ? Colors.white
                                      : ColorConstants.textSecondary,
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  label,
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                    color: selected
                                        ? Colors.white
                                        : ColorConstants.textSecondary,
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
      ],
    );
  }

  Widget _buildMenuSection(String title, List<Widget> items) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 8),
          child: Text(
            title.toUpperCase(),
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w800,
              color: ColorConstants.textSecondary,
              letterSpacing: 1.1,
            ),
          ),
        ),
        Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.02),
                blurRadius: 3,
                offset: const Offset(0, 1),
              ),
            ],
          ),
          child: Material(
            color: ColorConstants.surfaceWhite,
            borderRadius: BorderRadius.circular(16),
            clipBehavior: Clip.antiAlias,
            child: Column(
              children: items,
            ),
          ),
        ),
      ],
    );
  }

  Widget _menuItem(IconData icon, String title, String route) {
    return ListTile(
      leading: Icon(icon, color: ColorConstants.redRescue, size: 24),
      title: Text(
        title,
        style: TextStyle(
          fontWeight: FontWeight.w600,
          color: ColorConstants.textPrimary,
        ),
      ),
      trailing: Icon(Icons.chevron_right, size: 20, color: ColorConstants.textSecondary),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      onTap: () {
        if (route.isNotEmpty) {
          context.push(route);
        }
      },
    );
  }

  Widget _logoutButton(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 58,
      child: ElevatedButton.icon(
        icon: const Icon(Icons.logout, color: Colors.white),
        label: const Text(
          "ĐĂNG XUẤT TÀI KHOẢN",
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, letterSpacing: 0.5),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: ColorConstants.redRescue,
          foregroundColor: Colors.white,
          elevation: 4,
          shadowColor: ColorConstants.redRescue.withOpacity(0.5),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
        ),
        onPressed: () async {
          await context.read<AuthProvider>().logout();
          if (!context.mounted) return;
          context.read<UserProvider>().clear();
          context.go(RouterConstants.login);
        },
      ),
    );
  }
}
