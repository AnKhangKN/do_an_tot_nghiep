import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../user_provider.dart';

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
    final user = context.watch<UserProvider>().user;

    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(user?.fullName ?? "Chưa có user"),

            const SizedBox(height: 20),

            ElevatedButton(
              onPressed: () {
                context.go('/login');
              },
              child: const Text("Đi tới Login"),
            ),

            const SizedBox(height: 10),

            ElevatedButton(
              onPressed: () {
                context.go('/register');
              },
              child: const Text("Đi tới Register"),
            ),
          ],
        ),
      ),
    );
  }
}
