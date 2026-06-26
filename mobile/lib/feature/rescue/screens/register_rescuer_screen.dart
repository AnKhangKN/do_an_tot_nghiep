import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../../core/constants/app_router_constants.dart';
import '../providers/register_rescuer_provider.dart';

class RegisterRescuerScreen extends StatefulWidget {
  const RegisterRescuerScreen({super.key});

  @override
  State<RegisterRescuerScreen> createState() =>
      _RegisterRescuerScreenState();
}

class _RegisterRescuerScreenState
    extends State<RegisterRescuerScreen> {
  final _phoneController = TextEditingController();
  final _areaController = TextEditingController();

  String? _incidentTypeId;
  String? _gender;

  @override
  void initState() {
    super.initState();

    Future.microtask(() {
      context.read<RegisterRescuerProvider>().loadIncidentTypes();
    });
  }

  @override
  void dispose() {
    _phoneController.dispose();
    _areaController.dispose();
    super.dispose();
  }

  InputDecoration _inputDecoration(String label) {
    return InputDecoration(
      labelText: label,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
      ),
    );
  }

  Future<void> _submit() async {
    if (_phoneController.text.trim().isEmpty) return;
    if (_gender == null) return;
    if (_areaController.text.trim().isEmpty) return;
    if (_incidentTypeId == null) return;

    try {
      await context.read<RegisterRescuerProvider>().registerRescuer(
        phone: _phoneController.text.trim(),
        gender: _gender!,
        area: _areaController.text.trim(),
        incidentTypeId: _incidentTypeId!,
      );

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Đăng ký người cứu hộ thành công',
          ),
        ),
      );

      context.go(RouterConstants.profile);
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString()),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<RegisterRescuerProvider>();

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
            ),
            child: Column(
              children: [
                TextField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  decoration: _inputDecoration(
                    'Số điện thoại',
                  ),
                ),

                const SizedBox(height: 16),

                DropdownButtonFormField<String>(
                  value: _gender,
                  decoration: _inputDecoration(
                    'Giới tính',
                  ),
                  items: const [
                    DropdownMenuItem(
                      value: 'MALE',
                      child: Text('Nam'),
                    ),
                    DropdownMenuItem(
                      value: 'FEMALE',
                      child: Text('Nữ'),
                    ),
                    DropdownMenuItem(
                      value: 'OTHER',
                      child: Text('Khác'),
                    ),
                  ],
                  onChanged: (value) {
                    setState(() {
                      _gender = value;
                    });
                  },
                ),

                const SizedBox(height: 16),

                DropdownButtonFormField<String>(
                  value: _incidentTypeId,
                  decoration: _inputDecoration(
                    'Loại cứu hộ',
                  ),
                  items: provider.incidentTypes
                      .map(
                        (item) => DropdownMenuItem(
                      value: item.incidentTypeId,
                      child: Text(
                        item.incidentType,
                      ),
                    ),
                  )
                      .toList(),
                  onChanged: (value) {
                    setState(() {
                      _incidentTypeId = value;
                    });
                  },
                ),

                const SizedBox(height: 16),

                TextField(
                  controller: _areaController,
                  decoration: _inputDecoration(
                    'Khu vực',
                  ),
                ),

                const SizedBox(height: 24),

                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: provider.loading
                        ? null
                        : _submit,
                    child: provider.loading
                        ? const CircularProgressIndicator()
                        : const Text(
                      'Hoàn tất đăng ký',
                    ),
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