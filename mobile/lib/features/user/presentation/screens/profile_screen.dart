import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../../core/constants/color_constants.dart';
import '../../../../core/constants/router_constants.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../providers/user_provider.dart';

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

  @override
  Widget build(BuildContext context) {
    final userProvider = context.watch<UserProvider>();
    final user = userProvider.user;

    return Scaffold(
      backgroundColor: ColorConstants.backgroundLight,
      body: CustomScrollView(
        slivers: [
          // Header với hiệu ứng Sliver
          _buildSliverHeader(user),
          
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  // Thẻ trạng thái sẵn sàng (Tính năng đặc thù cứu hộ)
                  _buildAvailabilityCard(),
                  
                  const SizedBox(height: 20),

                  // Nhóm menu: Hoạt động
                  _buildMenuSection(
                    "Hoạt động cứu hộ",
                    [
                      _menuItem(Icons.history, "Lịch sử hỗ trợ", RouterConstants.history),
                      _menuItem(Icons.warning_amber_rounded, "Điểm cảnh báo đã tạo", ""),
                      if (user?.role != 'RESCUER')
                        _menuItem(Icons.verified_user_outlined, "Đăng ký cứu hộ viên", RouterConstants.registerRescuer),
                    ],
                  ),

                  const SizedBox(height: 20),

                  // Nhóm menu: Tài khoản & Hệ thống
                  _buildMenuSection(
                    "Tài khoản & Hệ thống",
                    [
                      _menuItem(Icons.person_outline, "Thông tin cá nhân", ""),
                      _menuItem(Icons.settings_outlined, "Cấu hình ứng dụng", RouterConstants.setting),
                      _menuItem(Icons.help_outline, "Trung tâm trợ giúp", ""),
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
        ],
      ),
    );
  }

  Widget _buildSliverHeader(user) {
    return SliverAppBar(
      expandedHeight: 220,
      pinned: true,
      stretch: true,
      backgroundColor: ColorConstants.redRescue,
      flexibleSpace: FlexibleSpaceBar(
        background: Container(
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
              Container(
                padding: const EdgeInsets.all(4),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                ),
                child: CircleAvatar(
                  radius: 45,
                  backgroundColor: ColorConstants.backgroundLight,
                  child: Text(
                    (user?.fullName ?? "U")[0].toUpperCase(),
                    style: const TextStyle(
                      fontSize: 36, 
                      fontWeight: FontWeight.w900, 
                      color: ColorConstants.redRescue
                    ),
                  ),
                ),
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
    );
  }

  Widget _buildAvailabilityCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ColorConstants.surfaceWhite,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isAvailable ? ColorConstants.success.withOpacity(0.1) : ColorConstants.textSecondary.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              isAvailable ? Icons.gpp_good : Icons.gpp_maybe,
              color: isAvailable ? ColorConstants.success : ColorConstants.textSecondary,
              size: 28,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "Chế độ sẵn sàng",
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17),
                ),
                Text(
                  isAvailable ? "Bạn đang sẵn sàng nhận cứu hộ" : "Bạn đang ở trạng thái ngoại tuyến",
                  style: const TextStyle(color: ColorConstants.textSecondary, fontSize: 13),
                ),
              ],
            ),
          ),
          Switch.adaptive(
            value: isAvailable,
            activeColor: ColorConstants.success,
            onChanged: (val) {
              setState(() {
                isAvailable = val;
              });
            },
          ),
        ],
      ),
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
            style: const TextStyle(
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
        style: const TextStyle(
          fontWeight: FontWeight.w600,
          color: ColorConstants.textPrimary,
        ),
      ),
      trailing: const Icon(Icons.chevron_right, size: 20, color: ColorConstants.textSecondary),
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
