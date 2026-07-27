import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../core/di/di.dart';
import '../../../../core/session/session_controller.dart';
import '../../../../core/storage/storage_service.dart';
import '../../../../shared/widgtes/image_picker_helper.dart';
import '../../../auth/data/auth_repository.dart';
import '../providers/victim_map_provider.dart';
import 'victim_searching_widget.dart';


class VictimSosButtonWidget extends StatefulWidget {
  final double? victimLat;
  final double? victimLng;

  const VictimSosButtonWidget({
    super.key,
    required this.victimLat,
    required this.victimLng,
  });

  @override
  State<VictimSosButtonWidget> createState() =>
      _VictimSosButtonWidgetState();
}

class _VictimSosButtonWidgetState
    extends State<VictimSosButtonWidget> with SingleTickerProviderStateMixin {
  final TextEditingController phoneController =
  TextEditingController();

  final TextEditingController descriptionController =
  TextEditingController();

  String? selectedIncidentTypeId;

  // Quản lý animation nhấn giữ
  late AnimationController _animationController;
  double _progressValue = 0.0;
  bool _isPressing = false;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2), // Thời gian nhấn giữ 2 giây
    );

    _animationController.addListener(() {
      setState(() {
        _progressValue = _animationController.value;
      });
    });

    _animationController.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        // Nhấn giữ đủ thời gian -> Mở Form SOS
        _animationController.reset();
        setState(() {
          _progressValue = 0.0;
          _isPressing = false;
        });
        _showSosForm();
      }
    });

    _loadSavedPhone();
  }

  @override
  void dispose() {
    phoneController.dispose();
    descriptionController.dispose();
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _loadSavedPhone() async {
    try {
      final storage = getIt<StorageService>();
      final savedPhone = await storage.getSavedPhone();
      if (savedPhone != null && savedPhone.trim().isNotEmpty && mounted) {
        phoneController.text = savedPhone.trim();
        return;
      }

      // Nếu trong storage chưa có, tự động lấy SĐT từ Profile User (GetMe)
      final authRepo = getIt<AuthRepository>();
      final user = await authRepo.getMe();
      if (user.phone != null && user.phone!.trim().isNotEmpty && mounted) {
        phoneController.text = user.phone!.trim();
        await storage.saveSavedPhone(user.phone!.trim());
      }
    } catch (e) {
      debugPrint("🚨 Không thể load số điện thoại đã lưu: $e");
    }
  }

  void _showSosForm() {
    String? selectedSosImagePath;

    // Nếu danh sách loại sự cố chưa load thì mới fetch
    final provider = context.read<VictimMapProvider>();
    if (provider.incidentTypes.isEmpty) {
      provider.loadIncidentTypes();
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      enableDrag: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setBottomSheetState) {
            return DraggableScrollableSheet(
              initialChildSize: 0.8,
              minChildSize: 0.4,
              maxChildSize: 0.95,
              expand: false,
              builder: (context, scrollController) {
                return Container(
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.vertical(
                      top: Radius.circular(24),
                    ),
                  ),
                  child: Padding(
                    padding: EdgeInsets.only(
                      left: 20,
                      right: 20,
                      top: 12,
                      bottom:
                      MediaQuery.of(context).viewInsets.bottom +
                          20,
                    ),
                    child: ListView(
                      controller: scrollController,
                      children: [
                        Center(
                          child: Container(
                            width: 50,
                            height: 5,
                            decoration: BoxDecoration(
                              color: Colors.grey.shade300,
                              borderRadius:
                              BorderRadius.circular(10),
                            ),
                          ),
                        ),

                        const SizedBox(height: 20),

                        const Text(
                          "Yêu cầu cứu hộ",
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                          ),
                        ),

                        const SizedBox(height: 16),

                        TextField(
                          controller: phoneController,
                          keyboardType: TextInputType.phone,
                          decoration: InputDecoration(
                            labelText: "Số điện thoại",
                            border: OutlineInputBorder(
                              borderRadius:
                              BorderRadius.circular(12),
                            ),
                          ),
                        ),

                        const SizedBox(height: 16),

                        Consumer<VictimMapProvider>(
                          builder: (context, provider, child) {
                            if (provider.loadingIncidentTypes) {
                              return const Center(
                                child:
                                CircularProgressIndicator(),
                              );
                            }

                            return DropdownButtonFormField<
                                String>(
                              value: selectedIncidentTypeId,
                              decoration: InputDecoration(
                                labelText: "Loại sự cố",
                                border: OutlineInputBorder(
                                  borderRadius:
                                  BorderRadius.circular(12),
                                ),
                              ),
                              items: provider.incidentTypes
                                  .map(
                                    (item) =>
                                    DropdownMenuItem<String>(
                                      value:
                                      item.incidentTypeId,
                                      child: Text(item.incidentType),
                                    ),
                              )
                                  .toList(),
                              onChanged: (value) {
                                setBottomSheetState(() {
                                  selectedIncidentTypeId =
                                      value;
                                });
                              },
                            );
                          },
                        ),

                        const SizedBox(height: 16),

                        TextField(
                          controller: descriptionController,
                          maxLines: 3,
                          decoration: InputDecoration(
                            labelText: "Mô tả chi tiết",
                            border: OutlineInputBorder(
                              borderRadius:
                              BorderRadius.circular(12),
                            ),
                          ),
                        ),

                        const SizedBox(height: 16),

                        const Text(
                          "Ảnh hiện trường (Không bắt buộc)",
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.black87),
                        ),
                        const SizedBox(height: 8),

                        if (selectedSosImagePath == null)
                          OutlinedButton.icon(
                            onPressed: () async {
                              final xfile = await ImagePickerHelper.pickImage(context);
                              if (xfile != null) {
                                setBottomSheetState(() {
                                  selectedSosImagePath = xfile.path;
                                });
                              }
                            },
                            icon: const Icon(Icons.add_a_photo_outlined, color: Colors.redAccent),
                            label: const Text('Chụp / Chọn ảnh hiện trường', style: TextStyle(color: Colors.redAccent, fontSize: 13, fontWeight: FontWeight.w600)),
                            style: OutlinedButton.styleFrom(
                              side: BorderSide(color: Colors.red.shade200),
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                          )
                        else
                          Stack(
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(12),
                                child: Image.file(
                                  File(selectedSosImagePath!),
                                  height: 140,
                                  width: double.infinity,
                                  fit: BoxFit.cover,
                                ),
                              ),
                              Positioned(
                                top: 6,
                                right: 6,
                                child: GestureDetector(
                                  onTap: () {
                                    setBottomSheetState(() {
                                      selectedSosImagePath = null;
                                    });
                                  },
                                  child: Container(
                                    padding: const EdgeInsets.all(4),
                                    decoration: BoxDecoration(
                                      color: Colors.black.withValues(alpha: 0.6),
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(Icons.close, color: Colors.white, size: 18),
                                  ),
                                ),
                              ),
                            ],
                          ),


                        const SizedBox(height: 24),

                        Consumer<VictimMapProvider>(
                          builder: (context, provider, child) {
                            return SizedBox(
                              height: 55,
                              child: ElevatedButton(
                                onPressed: provider.loading
                                    ? null
                                    : () async {
                                  if (phoneController.text.trim().isEmpty) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(
                                        content: Text(
                                          "Vui lòng nhập số điện thoại liên hệ để gửi cứu hộ!",
                                        ),
                                        backgroundColor: Colors.red,
                                      ),
                                    );
                                    return;
                                  }

                                  if (selectedIncidentTypeId ==
                                      null) {
                                    ScaffoldMessenger.of(
                                        context)
                                        .showSnackBar(
                                      const SnackBar(
                                        content: Text(
                                          "Vui lòng chọn loại sự cố",
                                        ),
                                      ),
                                    );
                                    return;
                                  }

                                  if (widget.victimLat == null || widget.victimLng == null) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(
                                        content: Text(
                                          "Không thể xác định vị trí hiện tại của bạn. Vui lòng bật định vị GPS!",
                                        ),
                                      ),
                                    );
                                    return;
                                  }

                                  final success =
                                  await provider.sendSos(
                                    phoneController.text
                                        .trim(),
                                    selectedIncidentTypeId!,
                                    descriptionController
                                        .text
                                        .trim()
                                        .isEmpty
                                        ? null
                                        : descriptionController
                                        .text
                                        .trim(),
                                    widget.victimLat!,
                                    widget.victimLng!,
                                    imagePath: selectedSosImagePath,
                                  );


                                  if (!mounted) return;

                                  if (success) {
                                    // Lưu số điện thoại vừa gửi thành công vào Storage
                                    await getIt<StorageService>().saveSavedPhone(
                                      phoneController.text.trim(),
                                    );

                                    Navigator.pop(
                                        context);

                                    ScaffoldMessenger.of(
                                        context)
                                        .showSnackBar(
                                      const SnackBar(
                                        content: Text(
                                          "Đã gửi yêu cầu cứu hộ",
                                        ),
                                      ),
                                    );
                                  } else {
                                    final errorMsg = provider.errorMessage ?? "Gửi yêu cầu thất bại!";
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text(
                                          errorMsg,
                                          style: const TextStyle(fontWeight: FontWeight.bold),
                                        ),
                                        backgroundColor: Colors.red.shade700,
                                        duration: const Duration(seconds: 5),
                                      ),
                                    );
                                  }
                                },
                                style:
                                ElevatedButton.styleFrom(
                                  backgroundColor:
                                  const Color(
                                      0xFFDC2626),
                                  shape:
                                  RoundedRectangleBorder(
                                    borderRadius:
                                    BorderRadius.circular(
                                        12),
                                  ),
                                ),
                                child: provider.loading
                                    ? const SizedBox(
                                  width: 24,
                                  height: 24,
                                  child:
                                  CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white,
                                  ),
                                )
                                    : const Text(
                                  "GỬI YÊU CẦU",
                                  style: TextStyle(
                                    color:
                                    Colors.white,
                                    fontWeight:
                                    FontWeight.bold,
                                  ),
                                ),
                              ),
                            );
                          },
                        ),

                        const SizedBox(height: 20),
                      ],
                    ),
                  ),
                );
              },
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    // Bao trong ListenableBuilder để tự rebuild khi SessionController thay đổi state
    return ListenableBuilder(
      listenable: getIt<SessionController>(),
      builder: (context, _) {
        final isSearchingRescuer =
            getIt<SessionController>().isSearchingRescuer;

        // Khi đang tìm cứu hộ viên: hiển thị Box thông tin tìm kiếm kèm nút Hủy cứu hộ
        if (isSearchingRescuer) {
          return const VictimSearchingWidget();
        }

        // Nút SOS bình thường
        return GestureDetector(
          onTapDown: (_) {
            setState(() {
              _isPressing = true;
            });
            _animationController.forward();
          },
          onTapUp: (_) {
            if (_animationController.status != AnimationStatus.completed) {
              _animationController.reverse();
              setState(() {
                _isPressing = false;
              });
            }
          },
          onTapCancel: () {
            _animationController.reverse();
            setState(() {
              _isPressing = false;
            });
          },
          child: Container(
            height: 52,
            width: 150,
            padding: const EdgeInsets.symmetric(horizontal: 4),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(26),
              border: Border.all(
                color: _isPressing ? const Color(0xFFB91C1C) : const Color(0xFFDC2626),
                width: 1.4,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.12),
                  blurRadius: 18,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Row(
              children: [
                const SizedBox(width: 2),
                Stack(
                  alignment: Alignment.center,
                  children: [
                    if (_isPressing || _progressValue > 0.0)
                      SizedBox(
                        height: 44,
                        width: 44,
                        child: CircularProgressIndicator(
                          value: _progressValue,
                          strokeWidth: 2.5,
                          valueColor: const AlwaysStoppedAnimation<Color>(
                            Color(0xFFB91C1C),
                          ),
                          backgroundColor: Colors.grey.shade200,
                        ),
                      ),
                    Container(
                      height: 38,
                      width: 38,
                      alignment: Alignment.center,
                      decoration: const BoxDecoration(
                        color: Color(0xFFDC2626),
                        shape: BoxShape.circle,
                      ),
                      child: const Text(
                        'SOS',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(width: 8),
                Text(
                  _isPressing ? 'Giữ thêm...' : 'Cứu hộ',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    color: _isPressing ? const Color(0xFFB91C1C) : Colors.black87,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}