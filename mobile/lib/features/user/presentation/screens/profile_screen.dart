import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:mobile/core/constants/router_constants.dart';

import '../../../auth/presentation/providers/auth_provider.dart';
import '../providers/user_provider.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  @override
  void initState() {
    super.initState();

    Future.microtask(() {
      context.read<UserProvider>().getProfile();
    });
  }

  @override
  Widget build(BuildContext context) {
    final userProvider = context.watch<UserProvider>();
    final user = userProvider.user;

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      body: SafeArea(
        child: Column(
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Color(0xFFFD6D27),
                    Color(0xFFFF8C42),
                  ],
                ),
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(32),
                  bottomRight: Radius.circular(32),
                ),
              ),
              child: Column(
                children: [
                  const SizedBox(height: 24),

                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black12,
                          blurRadius: 15,
                          offset: Offset(0, 6),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        const CircleAvatar(
                          radius: 29,
                          child: Icon(Icons.person),
                        ),

                        const SizedBox(width: 14),

                        Expanded(
                          child: Column(
                            crossAxisAlignment:
                            CrossAxisAlignment.start,
                            children: [
                              Text(
                                user?.fullName ?? "Đang tải...",
                                style: const TextStyle(
                                  fontSize: 17,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),

                              const SizedBox(height: 4),

                              Text(
                                user?.email ?? "",
                                style: TextStyle(
                                  color: Colors.grey.shade600,
                                  fontSize: 13,
                                ),
                              ),
                            ],
                          ),
                        ),

                        TextButton(
                          onPressed: () {},
                          child: const Text("Hồ sơ"),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            Expanded(
              child: ListView(
                padding:
                const EdgeInsets.symmetric(horizontal: 16),
                children: [
                  _menu(Icons.settings, "Cài đặt"),
                  _menu(Icons.history, "Lịch sử cứu hộ"),
                  _menu(Icons.info, "Thông tin app"),

                  const SizedBox(height: 24),

                  ElevatedButton(
                    onPressed: () async {
                      await context
                          .read<AuthProvider>()
                          .logout();

                      context.read<UserProvider>().clear();

                      if (!context.mounted) return;

                      context.go(
                        RouterConstants.login,
                      );
                    },
                    child: const Text("Đăng xuất"),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _menu(
      IconData icon,
      String title,
      ) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
    );
  }
}