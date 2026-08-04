import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../../core/constants/color_constants.dart';
import '../../../../core/constants/router_constants.dart';
import '../../../../core/utils/app_snackbar.dart';
import '../providers/rescuer_register_provider.dart';

class RescuerRegisterScreen extends StatefulWidget {
  const RescuerRegisterScreen({super.key});

  @override
  State<RescuerRegisterScreen> createState() => _RescuerRegisterScreenState();
}

class _RescuerRegisterScreenState extends State<RescuerRegisterScreen> {
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
      labelStyle: TextStyle(
        color: ColorConstants.textSecondary,
        fontWeight: FontWeight.w500,
      ),
      prefixIcon: Icon(prefixIcon, color: ColorConstants.redRescue, size: 22),
      filled: true,
      fillColor: ColorConstants.bgCanvas,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: BorderSide(color: ColorConstants.border, width: 1.5),
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

      AppSnackBar.show(
        context,
        'Đăng ký người cứu hộ thành công!',
        type: AppSnackBarType.success,
      );

      context.go(RouterConstants.profile);
    } catch (e) {
      if (!mounted) return;

      String errorMessage = e.toString().replaceAll("Exception: ", "");
      if (e is DioException) {
        final resData = e.response?.data;
        if (resData is Map && resData['message'] != null) {
          errorMessage = resData['message'].toString();
        }
      }

      AppSnackBar.show(context, errorMessage, type: AppSnackBarType.error);
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<RescuerRegisterProvider>();

    return Scaffold(
      resizeToAvoidBottomInset: true,
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
          icon: Icon(
            Icons.arrow_back_ios_new_rounded,
            color: ColorConstants.textPrimary,
          ),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            _buildPreviewPanel(provider),
            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                child: Column(
                  children: [
                    // Header Illustration
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(
                        vertical: 24,
                        horizontal: 20,
                      ),
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
                          Text(
                            "THAM GIA ĐỘI CỨU HỘ",
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.w900,
                              color: ColorConstants.textPrimary,
                              letterSpacing: 1.1,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
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
                              Text(
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
                                onChanged: (_) => setState(() {}),
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
                              Text(
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
                                dropdownColor: ColorConstants.surfaceWhite,
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
                              Text(
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
                                dropdownColor: ColorConstants.surfaceWhite,
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
                                onChanged: (_) => setState(() {}),
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
                                    disabledBackgroundColor: ColorConstants
                                        .redRescue
                                        .withOpacity(0.5),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(16),
                                    ),
                                    elevation: 2,
                                    shadowColor: ColorConstants.redRescue
                                        .withOpacity(0.3),
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
          ],
        ),
      ),
    );
  }

  Widget _buildPreviewPanel(RescuerRegisterProvider provider) {
    final phone = _phoneController.text.trim();
    final area = _areaController.text.trim();
    final gender = _genderLabel(_gender);
    final specialty = _specialtyLabel(_incidentTypeId, provider);
    final hasData =
        phone.isNotEmpty ||
        gender != null ||
        specialty != null ||
        area.isNotEmpty;

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.fromLTRB(16, 8, 16, 0),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: ColorConstants.surfaceWhite,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: ColorConstants.redRescue.withValues(alpha: 0.25),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: hasData
          ? Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                const Row(
                  children: [
                    Icon(
                      Icons.visibility_outlined,
                      size: 16,
                      color: ColorConstants.redRescue,
                    ),
                    SizedBox(width: 6),
                    Text(
                      'Xem trước thông tin đăng ký',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: ColorConstants.redRescue,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                if (phone.isNotEmpty)
                  _previewRow(
                    'Số điện thoại',
                    phone,
                    Icons.phone_android_rounded,
                  ),
                if (gender != null)
                  _previewRow('Giới tính', gender, Icons.wc_rounded),
                if (specialty != null)
                  _previewRow(
                    'Chuyên môn cứu hộ',
                    specialty,
                    Icons.medical_services_rounded,
                  ),
                if (area.isNotEmpty)
                  _previewRow(
                    'Khu vực hoạt động',
                    area,
                    Icons.location_on_rounded,
                  ),
              ],
            )
          : Row(
              children: [
                Icon(
                  Icons.visibility_outlined,
                  size: 16,
                  color: ColorConstants.textMuted,
                ),
                SizedBox(width: 6),
                Expanded(
                  child: Text(
                    'Thông tin bạn nhập sẽ hiển thị trước tại đây',
                    style: TextStyle(
                      fontSize: 12,
                      color: ColorConstants.textMuted,
                    ),
                  ),
                ),
              ],
            ),
    );
  }

  Widget _previewRow(String label, String value, IconData icon) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 15, color: ColorConstants.redRescue),
          const SizedBox(width: 8),
          Text(
            '$label: ',
            style: TextStyle(fontSize: 12, color: ColorConstants.textSecondary),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: ColorConstants.textPrimary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  String? _genderLabel(String? value) {
    switch (value) {
      case 'MALE':
        return 'Nam';
      case 'FEMALE':
        return 'Nữ';
      case 'OTHER':
        return 'Khác';
      default:
        return null;
    }
  }

  String? _specialtyLabel(String? id, RescuerRegisterProvider provider) {
    if (id == null) return null;
    for (final item in provider.incidentTypes) {
      if (item.incidentTypeId == id) return item.incidentType;
    }
    return null;
  }
}
