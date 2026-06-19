import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../../core/constants/app_router_constants.dart';
import '../providers/register_rescuer_provider.dart';

class RegisterRescuerScreen extends StatefulWidget {
  const RegisterRescuerScreen({super.key});

  @override
  State<RegisterRescuerScreen> createState() => _RegisterRescuerScreenState();
}

class _RegisterRescuerScreenState extends State<RegisterRescuerScreen> {
  final _fullNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _genderController = TextEditingController();

  @override
  void dispose() {
    _fullNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _genderController.dispose();
    super.dispose();
  }

  void _nextStep() {
    if (_fullNameController.text.trim().isEmpty ||
        _emailController.text.trim().isEmpty ||
        _phoneController.text.trim().isEmpty ||
        _genderController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng nhập đầy đủ thông tin')),
      );
      return;
    }

    context.read<RegisterRescuerProvider>().saveStep1(
      fullName: _fullNameController.text.trim(),
      email: _emailController.text.trim(),
      phone: _phoneController.text.trim(),
      gender: _genderController.text.trim(),
    );

    context.push(RouterConstants.registerRescuerStep2);
  }

  InputDecoration _inputDecoration(String label) {
    return InputDecoration(
      labelText: label,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      appBar: AppBar(
        title: const Text('Đăng ký người cứu hộ'),
        leading: IconButton(
          onPressed: () {
            context.go(RouterConstants.profile);
          },
          icon: const Icon(Icons.arrow_back),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              children: [
                TextField(
                  controller: _fullNameController,
                  decoration: _inputDecoration('Họ và tên'),
                ),

                const SizedBox(height: 16),

                TextField(
                  controller: _emailController,
                  // keyboardType: TextInputType.emailAddress,
                  decoration: _inputDecoration('Email'),
                ),

                const SizedBox(height: 16),

                TextField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  decoration: _inputDecoration('Số điện thoại'),
                ),

                const SizedBox(height: 16),

                TextField(
                  controller: _genderController,
                  decoration: _inputDecoration('Giới tính'),
                ),

                const SizedBox(height: 24),

                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: _nextStep,
                    child: const Text('Bước tiếp theo'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
