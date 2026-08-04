import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'package:go_router/go_router.dart';
import '../../../../core/constants/color_constants.dart';
import '../../../../core/constants/router_constants.dart';
import '../../../../core/di/di.dart';
import '../../../../core/session/session_controller.dart';
import '../../../../core/storage/storage_service.dart';
import '../../../../core/utils/app_snackbar.dart';
import '../../../../shared/widgtes/image_picker_helper.dart';
import '../../../auth/data/auth_repository.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
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
  State<VictimSosButtonWidget> createState() => _VictimSosButtonWidgetState();
}

class _VictimSosButtonWidgetState extends State<VictimSosButtonWidget>
    with SingleTickerProviderStateMixin {
  final TextEditingController phoneController = TextEditingController();

  final TextEditingController descriptionController = TextEditingController();

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
      duration: const Duration(seconds: 1), // Thời gian nhấn giữ 1 giây
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

  bool _isGuestPhoneSaved = false;

  Future<void> _loadSavedPhone() async {
    try {
      final storage = getIt<StorageService>();
      final session = getIt<SessionController>();

      if (session.isGuest) {
        final guestPhone = await storage.getGuestPhone();
        if (guestPhone != null && guestPhone.trim().isNotEmpty && mounted) {
          phoneController.text = guestPhone.trim();
          setState(() {
            _isGuestPhoneSaved = true;
          });
          return;
        }
      }

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

  Future<void> _showSosForm() async {
    final session = getIt<SessionController>();
    final blocked = session.cancelBlockedMessage;
    if (blocked != null && blocked.isNotEmpty) {
      AppSnackBar.show(
        context,
        blocked,
        type: AppSnackBarType.error,
        duration: const Duration(seconds: 5),
      );
      return;
    }

    // 0. Kiểm tra giới hạn SOS cho tài khoản Guest (dựa vào isGuest hoặc phone đã lưu trên thiết bị)
    final storageService = getIt<StorageService>();
    final guestPhone = await storageService.getGuestPhone();
    final bool isGuestDevice = session.isGuest || guestPhone != null;
    if (isGuestDevice) {
      final countToday = await storageService.getGuestSosCountToday();
      if (countToday >= 2) {
        if (!mounted) return;
        _showGuestLimitDialog();
        return;
      }
    }

    String? selectedSosImagePath;

    // Nếu danh sách loại sự cố chưa load thì mới fetch
    final provider = context.read<VictimMapProvider>();
    if (provider.incidentTypes.isEmpty) {
      provider.loadIncidentTypes();
    }

    if (!mounted) return;

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
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.surface,
                    borderRadius: BorderRadius.vertical(
                      top: Radius.circular(24),
                    ),
                  ),
                  child: MediaQuery.removeViewInsets(
                    removeBottom: true,
                    context: context,
                    child: RepaintBoundary(
                      child: Padding(
                        padding: const EdgeInsets.only(
                          left: 20,
                          right: 20,
                          top: 12,
                          bottom: 20,
                        ),
                        child: ListView(
                          controller: scrollController,
                          children: [
                            Center(
                              child: Container(
                                width: 50,
                                height: 5,
                                decoration: BoxDecoration(
                                  color:
                                      Theme.of(context).brightness ==
                                          Brightness.dark
                                      ? Colors.grey.shade700
                                      : Colors.grey.shade300,
                                  borderRadius: BorderRadius.circular(10),
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
                              readOnly: _isGuestPhoneSaved,
                              keyboardType: TextInputType.phone,
                              decoration: InputDecoration(
                                labelText: "Số điện thoại",
                                suffixIcon: _isGuestPhoneSaved
                                    ? const Icon(Icons.lock_rounded, color: Colors.amber, size: 18)
                                    : null,
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                            ),
                            if (_isGuestPhoneSaved) ...[
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  Icon(Icons.info_outline_rounded, size: 13, color: Colors.amber.shade900),
                                  const SizedBox(width: 4),
                                  Expanded(
                                    child: Text(
                                      'Số điện thoại đã được cố định cho tài khoản Khách trên thiết bị này.',
                                      style: TextStyle(fontSize: 11, color: Colors.amber.shade900, fontWeight: FontWeight.w500),
                                    ),
                                  ),
                                ],
                              ),
                            ],

                            const SizedBox(height: 16),

                            Consumer<VictimMapProvider>(
                              builder: (context, provider, child) {
                                if (provider.loadingIncidentTypes) {
                                  return const Center(
                                    child: CircularProgressIndicator(),
                                  );
                                }

                                return DropdownButtonFormField<String>(
                                  value: selectedIncidentTypeId,
                                  decoration: InputDecoration(
                                    labelText: "Loại sự cố",
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                  ),
                                  items: provider.incidentTypes
                                      .map(
                                        (item) => DropdownMenuItem<String>(
                                          value: item.incidentTypeId,
                                          child: Text(item.incidentType),
                                        ),
                                      )
                                      .toList(),
                                  onChanged: (value) {
                                    setBottomSheetState(() {
                                      selectedIncidentTypeId = value;
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
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                            ),

                            const SizedBox(height: 16),

                            Text(
                              "Ảnh hiện trường (Không bắt buộc)",
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: Theme.of(context).colorScheme.onSurface,
                              ),
                            ),
                            const SizedBox(height: 8),

                            if (selectedSosImagePath == null)
                              OutlinedButton.icon(
                                onPressed: () async {
                                  final xfile =
                                      await ImagePickerHelper.pickImage(
                                        context,
                                      );
                                  if (xfile != null) {
                                    setBottomSheetState(() {
                                      selectedSosImagePath = xfile.path;
                                    });
                                  }
                                },
                                icon: const Icon(
                                  Icons.add_a_photo_outlined,
                                  color: Colors.redAccent,
                                ),
                                label: const Text(
                                  'Chụp / Chọn ảnh hiện trường',
                                  style: TextStyle(
                                    color: Colors.redAccent,
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                style: OutlinedButton.styleFrom(
                                  side: BorderSide(color: Colors.red.shade200),
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 12,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
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
                                          color: Colors.black.withValues(
                                            alpha: 0.6,
                                          ),
                                          shape: BoxShape.circle,
                                        ),
                                        child: const Icon(
                                          Icons.close,
                                          color: Colors.white,
                                          size: 18,
                                        ),
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
                                            if (phoneController.text
                                                .trim()
                                                .isEmpty) {
                                              AppSnackBar.show(
                                                context,
                                                "Vui lòng nhập số điện thoại liên hệ để gửi cứu hộ!",
                                                type: AppSnackBarType.error,
                                              );
                                              return;
                                            }

                                            if (selectedIncidentTypeId ==
                                                null) {
                                              AppSnackBar.show(
                                                context,
                                                "Vui lòng chọn loại sự cố",
                                              );
                                              return;
                                            }

                                            if (widget.victimLat == null ||
                                                widget.victimLng == null) {
                                              AppSnackBar.show(
                                                context,
                                                "Không thể xác định vị trí hiện tại của bạn. Vui lòng bật định vị GPS!",
                                              );
                                              return;
                                            }

                                            // 0. Kiểm tra giới hạn SOS cho tài khoản Guest (dựa vào isGuest hoặc phone đã lưu trên thiết bị)
                                            final session = getIt<SessionController>();
                                            final storageService = getIt<StorageService>();
                                            final guestPhoneInner = await storageService.getGuestPhone();
                                            final bool isGuestDeviceInner = session.isGuest || guestPhoneInner != null;

                                            if (isGuestDeviceInner) {
                                              final countToday = await storageService.getGuestSosCountToday();
                                              if (countToday >= 2) {
                                                if (!mounted) return;
                                                _showGuestLimitDialog();
                                                return;
                                              }
                                            }

                                            final success = await provider
                                                .sendSos(
                                                  phoneController.text.trim(),
                                                  selectedIncidentTypeId!,
                                                  descriptionController.text
                                                          .trim()
                                                          .isEmpty
                                                      ? null
                                                      : descriptionController
                                                            .text
                                                            .trim(),
                                                  widget.victimLat!,
                                                  widget.victimLng!,
                                                  imagePath:
                                                      selectedSosImagePath,
                                                );

                                            if (!mounted) return;

                                            if (success) {
                                              // Nếu là Guest thì tăng đếm số lần gửi SOS trong ngày & lưu SĐT cố định
                                              if (isGuestDeviceInner) {
                                                await storageService.incrementGuestSosCount();
                                                await storageService.saveGuestPhone(phoneController.text.trim());
                                              }

                                              // Lưu số điện thoại vừa gửi thành công vào Storage
                                              await storageService
                                                  .saveSavedPhone(
                                                    phoneController.text.trim(),
                                                  );

                                              Navigator.pop(context);

                                              AppSnackBar.show(
                                                context,
                                                "Đã gửi yêu cầu cứu hộ",
                                                type: AppSnackBarType.success,
                                              );
                                            } else {
                                              final errorMsg =
                                                  provider.errorMessage ??
                                                  "Gửi yêu cầu thất bại!";
                                              AppSnackBar.show(
                                                context,
                                                errorMsg,
                                                type: AppSnackBarType.error,
                                                duration: const Duration(
                                                  seconds: 5,
                                                ),
                                              );
                                            }
                                          },
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFFDC2626),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                    ),
                                    child: provider.loading
                                        ? const SizedBox(
                                            width: 24,
                                            height: 24,
                                            child: CircularProgressIndicator(
                                              strokeWidth: 2,
                                              color: Colors.white,
                                            ),
                                          )
                                        : const Text(
                                            "GỬI YÊU CẦU",
                                            style: TextStyle(
                                              color: Colors.white,
                                              fontWeight: FontWeight.bold,
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

  /// Widget cảnh báo khi victim bị khóa do hủy ca cứu hộ liên tiếp
  Widget _buildCancelBlockedWidget(String message) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      height: 52,
      constraints: const BoxConstraints(maxWidth: 320),
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: isDark ? theme.colorScheme.surface : Colors.white,
        borderRadius: BorderRadius.circular(26),
        border: Border.all(color: const Color(0xFFDC2626), width: 1.4),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.12),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.block, color: Color(0xFFDC2626), size: 22),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              message,
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: const Color(0xFFB91C1C),
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Bao trong ListenableBuilder để tự rebuild khi SessionController thay đổi state
    return ListenableBuilder(
      listenable: getIt<SessionController>(),
      builder: (context, _) {
        final session = getIt<SessionController>();
        final isSearchingRescuer = session.isSearchingRescuer;

        // Victim đang bị khóa vì hủy ca liên tiếp: hiển thị cảnh báo thay vì nút SOS
        final cancelBlockedMessage = session.cancelBlockedMessage;
        if (cancelBlockedMessage != null && cancelBlockedMessage.isNotEmpty) {
          return _buildCancelBlockedWidget(cancelBlockedMessage);
        }

        // Khi đang tìm cứu hộ viên: hiển thị Box thông tin tìm kiếm kèm nút Hủy cứu hộ
        if (isSearchingRescuer) {
          return const VictimSearchingWidget();
        }

        final theme = Theme.of(context);
        final isDark = theme.brightness == Brightness.dark;

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
              color: isDark ? theme.colorScheme.surface : Colors.white,
              borderRadius: BorderRadius.circular(26),
              border: Border.all(
                color: _isPressing
                    ? const Color(0xFFB91C1C)
                    : const Color(0xFFDC2626),
                width: 1.4,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.12),
                  blurRadius: 8,
                  offset: const Offset(0, 4),
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
                          backgroundColor: isDark
                              ? Colors.white.withValues(alpha: 0.15)
                              : ColorConstants.bgCanvas,
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
                    color: _isPressing
                        ? const Color(0xFFB91C1C)
                        : (isDark ? Colors.white : Colors.black87),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showGuestLimitDialog() {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Row(
          children: [
            Icon(Icons.warning_amber_rounded, color: Colors.orange, size: 28),
            SizedBox(width: 8),
            Expanded(
              child: Text(
                'Giới Hạn Lượt Gửi SOS',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        content: const Text(
          'Tài khoản khách chỉ được gửi tối đa 2 yêu cầu cứu hộ khẩn cấp trong ngày.\n\nVui lòng đăng ký tài khoản chính thức để tiếp tục gửi cứu hộ không giới hạn!',
          style: TextStyle(fontSize: 14, height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(),
            child: const Text('Đóng', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.of(dialogContext).pop();
              await context.read<AuthProvider>().logout();
              if (context.mounted) {
                context.go(RouterConstants.register);
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: ColorConstants.redRescue,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('Đăng ký ngay', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
