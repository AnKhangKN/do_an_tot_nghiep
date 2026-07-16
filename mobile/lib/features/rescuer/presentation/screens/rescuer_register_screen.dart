import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../../core/constants/color_constants.dart';
import '../../../../core/constants/router_constants.dart';
import '../providers/rescuer_register_provider.dart';

class RescuerRegisterScreen extends StatefulWidget {
  const RescuerRegisterScreen({super.key});

  @override
  State<RescuerRegisterScreen> createState() =>
      _RescuerRegisterScreenState();
}

class _RescuerRegisterScreenState
    extends State<RescuerRegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _phoneController = TextEditingController();
  final _areaController = TextEditingController();

  String? _incidentTypeId;
  String? _gender;

  @override
  void initState() {
    super.initState();

    Future.microtask(() {
      context.read<RescuerRegisterProvider>().loadIncidentTypes();
    });
  }

  @override
  void dispose() {
    _phoneController.dispose();
    _areaController.dispose();
    super.dispose();
  }

  InputDecoration _inputDecoration(String label, IconData prefixIcon) {
    return InputDecoration(
      labelText: label,
      labelStyle: const TextStyle(
        color: ColorConstants.textSecondary,
        fontWeight: FontWeight.w500,
      ),
      prefixIcon: Icon(prefixIcon, color: ColorConstants.redRescue, size: 22),
      filled: true,
      fillColor: Colors.white,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: BorderSide(color: Colors.grey.shade200, width: 1.5),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: ColorConstants.redRescue, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: ColorConstants.error, width: 1.5),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: ColorConstants.error, width: 2),
      ),
    );
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    try {
      await context.read<RescuerRegisterProvider>().registerRescuer(
        phone: _phoneController.text.trim(),
        gender: _gender!,
        area: _areaController.text.trim(),
        incidentTypeId: _incidentTypeId!,
      );

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: ColorConstants.success,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          content: const Row(
            children: [
              Icon(Icons.check_circle_rounded, color: Colors.white),
              SizedBox(width: 12),
              Text(
                'Đăng ký người cứu hộ thành công!',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ),
      );

      context.go(RouterConstants.profile);
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: ColorConstants.error,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          content: Row(
            children: [
              const Icon(Icons.error_outline_rounded, color: Colors.white),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  e.toString().replaceAll("Exception: ", ""),
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<RescuerRegisterProvider>();

    return Scaffold(
      backgroundColor: ColorConstants.backgroundLight,
      appBar: AppBar(
        backgroundColor: ColorConstants.surfaceWhite,
        elevation: 0,
        centerTitle: true,
        title: const Text(
          'ĐĂNG KÝ CỨU HỘ',
          style: TextStyle(
            color: ColorConstants.redRescue,
            fontWeight: FontWeight.w900,
            letterSpacing: 1.1,
          ),
        ),
        leading: IconButton(
          onPressed: () {
            context.go(RouterConstants.profile);
          },
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: ColorConstants.textPrimary),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Column(
            children: [
              // Header Illustration
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 20),
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(3),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.06),
                            blurRadius: 12,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      child: ClipOval(
                        child: Image.asset(
                          'assets/icon/app_icon.png',
                          width: 75,
                          height: 75,
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      "THAM GIA ĐỘI CỨU HỘ",
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                        color: ColorConstants.textPrimary,
                        letterSpacing: 1.1,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      "Hãy hoàn thiện thông tin của bạn để gia nhập mạng lưới hỗ trợ khẩn cấp.",
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 13,
                        color: ColorConstants.textSecondary,
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),

              // Form Container
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: ColorConstants.surfaceWhite,
                    borderRadius: BorderRadius.circular(28),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.03),
                        blurRadius: 15,
                        offset: const Offset(0, 5),
                      ),
                    ],
                  ),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          "Thông tin liên hệ",
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            color: ColorConstants.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _phoneController,
                          keyboardType: TextInputType.phone,
                          decoration: _inputDecoration(
                            'Số điện thoại',
                            Icons.phone_android_rounded,
                          ),
                          validator: (value) {
                            if (value == null || value.trim().isEmpty) {
                              return 'Vui lòng nhập số điện thoại';
                            }
                            return null;
                          },
                        ),

                        const SizedBox(height: 20),
                        const Text(
                          "Thông tin cá nhân",
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            color: ColorConstants.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 12),
                        DropdownButtonFormField<String>(
                          value: _gender,
                          decoration: _inputDecoration(
                            'Giới tính',
                            Icons.wc_rounded,
                          ),
                          dropdownColor: Colors.white,
                          borderRadius: BorderRadius.circular(16),
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
                          validator: (value) {
                            if (value == null) {
                              return 'Vui lòng chọn giới tính';
                            }
                            return null;
                          },
                          onChanged: (value) {
                            setState(() {
                              _gender = value;
                            });
                          },
                        ),

                        const SizedBox(height: 20),
                        const Text(
                          "Chuyên môn & Khu vực cứu hộ",
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            color: ColorConstants.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 12),
                        DropdownButtonFormField<String>(
                          value: _incidentTypeId,
                          decoration: _inputDecoration(
                            'Chuyên môn cứu hộ',
                            Icons.medical_services_rounded,
                          ),
                          dropdownColor: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          items: provider.incidentTypes
                              .map(
                                (item) => DropdownMenuItem(
                                  value: item.incidentTypeId,
                                  child: Text(item.incidentType),
                                ),
                              )
                              .toList(),
                          validator: (value) {
                            if (value == null) {
                              return 'Vui lòng chọn loại cứu hộ';
                            }
                            return null;
                          },
                          onChanged: (value) {
                            setState(() {
                              _incidentTypeId = value;
                            });
                          },
                        ),

                        const SizedBox(height: 16),
                        TextFormField(
                          controller: _areaController,
                          decoration: _inputDecoration(
                            'Khu vực hoạt động',
                            Icons.location_on_rounded,
                          ),
                          validator: (value) {
                            if (value == null || value.trim().isEmpty) {
                              return 'Vui lòng nhập khu vực hoạt động';
                            }
                            return null;
                          },
                        ),

                        const SizedBox(height: 28),

                        SizedBox(
                          width: double.infinity,
                          height: 52,
                          child: ElevatedButton(
                            onPressed: provider.loading ? null : _submit,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: ColorConstants.redRescue,
                              foregroundColor: Colors.white,
                              disabledBackgroundColor: ColorConstants.redRescue.withOpacity(0.5),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                              elevation: 2,
                              shadowColor: ColorConstants.redRescue.withOpacity(0.3),
                            ),
                            child: provider.loading
                                ? const SizedBox(
                                    width: 24,
                                    height: 24,
                                    child: CircularProgressIndicator(
                                      color: Colors.white,
                                      strokeWidth: 2.5,
                                    ),
                                  )
                                : const Text(
                                    'HOÀN TẤT ĐĂNG KÝ',
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                      letterSpacing: 1.1,
                                    ),
                                  ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}