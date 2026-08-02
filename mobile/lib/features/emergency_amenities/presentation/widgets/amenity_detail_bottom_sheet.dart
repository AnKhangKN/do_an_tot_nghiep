import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/constants/color_constants.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/di/di.dart';
import '../../../../core/location/data/location_service.dart';
import '../../../../core/session/session_controller.dart';
import '../../../../core/utils/app_snackbar.dart';
import '../../data/models/emergency_amenity_model.dart';
import '../providers/amenity_provider.dart';
import '../amenity_icon_helper.dart';

class AmenityDetailBottomSheet extends StatelessWidget {
  final EmergencyAmenityModel amenity;

  const AmenityDetailBottomSheet({
    super.key,
    required this.amenity,
  });

  Future<void> _makeCall(String phoneNumber) async {
    final Uri launchUri = Uri(
      scheme: 'tel',
      path: phoneNumber,
    );
    if (await canLaunchUrl(launchUri)) {
      await launchUrl(launchUri);
    }
  }

  Future<void> _handleInAppNavigation(BuildContext context) async {
    final session = getIt<SessionController>();
    var pos = session.state.position;
    pos ??= await LocationService().getCurrentPosition();

    if (pos != null && context.mounted) {
      context.read<AmenityProvider>().startInAppNavigation(
        userLat: pos.latitude,
        userLng: pos.longitude,
        amenity: amenity,
      );
      Navigator.pop(context);
    } else {
      if (context.mounted) {
        AppSnackBar.show(
          context,
          'Vui lòng bật định vị GPS để vẽ tuyến đường chỉ đường!',
          type: AppSnackBarType.warning,
        );
      }
    }
  }

  Future<void> _openExternalMaps(double lat, double lng) async {
    final Uri googleMapsUri = Uri.parse(
      AppConstants.getGoogleMapsDirectionUrl(lat, lng),
    );
    final Uri geoUri = Uri.parse(
      AppConstants.getGeoSchemeUrl(lat, lng),
    );

    try {
      if (await canLaunchUrl(geoUri)) {
        await launchUrl(geoUri, mode: LaunchMode.externalApplication);
      } else if (await canLaunchUrl(googleMapsUri)) {
        await launchUrl(googleMapsUri, mode: LaunchMode.externalApplication);
      } else {
        await launchUrl(googleMapsUri, mode: LaunchMode.externalApplication);
      }
    } catch (e) {
      try {
        await launchUrl(googleMapsUri, mode: LaunchMode.externalApplication);
      } catch (_) {}
    }
  }

  void _showFullScreenImage(BuildContext context, String url) {
    showDialog(
      context: context,
      builder: (ctx) => Dialog.fullscreen(
        backgroundColor: Colors.black,
        child: Stack(
          children: [
            Center(
              child: InteractiveViewer(
                minScale: 0.8,
                maxScale: 4.0,
                child: Image.network(
                  url,
                  fit: BoxFit.contain,
                  errorBuilder: (c, e, s) => const Icon(Icons.broken_image, color: Colors.white54, size: 64),
                ),
              ),
            ),
            Positioned(
              top: MediaQuery.of(ctx).padding.top + 12,
              right: 16,
              child: GestureDetector(
                onTap: () => Navigator.pop(ctx),
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: const BoxDecoration(
                    color: Colors.black54,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.close, color: Colors.white, size: 24),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showReportDialog(BuildContext context) {
    String selectedReason = 'CLOSED_DOWN';
    final TextEditingController commentController = TextEditingController();

    showDialog(
      context: context,
      builder: (dialogCtx) => StatefulBuilder(
        builder: (ctx, setState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Row(
            children: [
              Icon(Icons.report_problem_rounded, color: Colors.orange),
              SizedBox(width: 8),
              Text('Báo cáo địa điểm', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Chọn lý do báo cáo để Admin kiểm tra và tạm dừng hiển thị nếu có vi phạm:',
                  style: TextStyle(fontSize: 12, color: ColorConstants.textSecondary),
                ),
                const SizedBox(height: 12),
                RadioListTile<String>(
                  value: 'CLOSED_DOWN',
                  groupValue: selectedReason,
                  title: const Text('Địa điểm đã đóng cửa / Không còn', style: TextStyle(fontSize: 13)),
                  onChanged: (val) => setState(() => selectedReason = val!),
                  contentPadding: EdgeInsets.zero,
                ),
                RadioListTile<String>(
                  value: 'SCAM_FRAUD',
                  groupValue: selectedReason,
                  title: const Text('Địa điểm lừa đảo / Giả mạo', style: TextStyle(fontSize: 13)),
                  onChanged: (val) => setState(() => selectedReason = val!),
                  contentPadding: EdgeInsets.zero,
                ),
                RadioListTile<String>(
                  value: 'INCORRECT_INFO',
                  groupValue: selectedReason,
                  title: const Text('Sai vị trí / Số điện thoại', style: TextStyle(fontSize: 13)),
                  onChanged: (val) => setState(() => selectedReason = val!),
                  contentPadding: EdgeInsets.zero,
                ),
                RadioListTile<String>(
                  value: 'OTHER',
                  groupValue: selectedReason,
                  title: const Text('Lý do khác', style: TextStyle(fontSize: 13)),
                  onChanged: (val) => setState(() => selectedReason = val!),
                  contentPadding: EdgeInsets.zero,
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: commentController,
                  maxLines: 2,
                  decoration: InputDecoration(
                    hintText: 'Nhập ghi chú chi tiết (Không bắt buộc)...',
                    hintStyle: const TextStyle(fontSize: 12),
                    filled: true,
                    fillColor: ColorConstants.bgCanvas,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogCtx),
              child: Text('Hủy', style: TextStyle(color: ColorConstants.textSecondary)),
            ),
            ElevatedButton(
              onPressed: () async {
                final provider = context.read<AmenityProvider>();
                final success = await provider.sendFeedback(
                  amenityId: amenity.amenityId,
                  reason: selectedReason,
                  comment: commentController.text.trim(),
                );

                if (dialogCtx.mounted) {
                  Navigator.pop(dialogCtx);
                  AppSnackBar.show(
                    context,
                    success
                        ? 'Cảm ơn phản hồi của bạn! Admin sẽ kiểm tra điểm tiện ích này.'
                        : 'Gửi báo cáo thất bại. Vui lòng thử lại sau!',
                    type: success
                        ? AppSnackBarType.success
                        : AppSnackBarType.error,
                  );
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: ColorConstants.redRescue,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Gửi báo cáo', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final categoryTitle = amenity.categoryName ?? 'Tiện ích cộng đồng';

    return ConstrainedBox(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.85,
      ),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: ColorConstants.surfaceWhite,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: ColorConstants.borderDark,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: ColorConstants.primaryLight,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      AmenityIconHelper.iconFor(amenity.iconName, categoryName: amenity.categoryName),
                      color: ColorConstants.primary,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          categoryTitle,
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: ColorConstants.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Tọa độ: ${amenity.latitude.toStringAsFixed(4)}, ${amenity.longitude.toStringAsFixed(4)}',
                          style: TextStyle(
                            fontSize: 12,
                            color: ColorConstants.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              const Divider(),
              const SizedBox(height: 12),
              Row(
                children: [
                  Icon(Icons.access_time_rounded, size: 18, color: ColorConstants.textMuted),
                  const SizedBox(width: 8),
                  Text(
                    'Giờ mở cửa: ${amenity.openingHours}',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: ColorConstants.textPrimary,
                    ),
                  ),
                ],
              ),
              if (amenity.imageUrl != null && amenity.imageUrl!.isNotEmpty) ...[
                const SizedBox(height: 12),
                GestureDetector(
                  onTap: () => _showFullScreenImage(context, amenity.imageUrl!),
                  child: Stack(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: Image.network(
                          amenity.imageUrl!,
                          height: 150,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) => const SizedBox.shrink(),
                        ),
                      ),
                      Positioned(
                        bottom: 8,
                        right: 8,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.6),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.zoom_in, color: Colors.white, size: 14),
                              SizedBox(width: 4),
                              Text(
                                'Xem ảnh lớn',
                                style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
              if (amenity.phone != null && amenity.phone!.isNotEmpty) ...[
                const SizedBox(height: 10),
                Row(
                  children: [
                    Icon(Icons.phone_rounded, size: 18, color: ColorConstants.textMuted),
                    const SizedBox(width: 8),
                    Text(
                      'SĐT liên hệ: ${amenity.phone}',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: ColorConstants.textPrimary,
                      ),
                    ),
                  ],
                ),
              ],

              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => _handleInAppNavigation(context),
                      icon: const Icon(Icons.navigation_rounded, color: Colors.white),
                      label: const Text('Chỉ đường trên App', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: ColorConstants.primary,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                    ),
                  ),
                  if (amenity.phone != null && amenity.phone!.isNotEmpty) ...[
                    const SizedBox(width: 10),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () => _makeCall(amenity.phone!),
                        icon: const Icon(Icons.phone, color: Colors.white),
                        label: const Text('Gọi điện', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: ColorConstants.success,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  TextButton.icon(
                    onPressed: () => _openExternalMaps(amenity.latitude, amenity.longitude),
                    icon: const Icon(Icons.open_in_new_rounded, size: 16, color: ColorConstants.secondary),
                    label: const Text('Maps', style: TextStyle(fontSize: 12, color: ColorConstants.secondary)),
                  ),
                  TextButton.icon(
                    onPressed: () => _showReportDialog(context),
                    icon: const Icon(Icons.flag_outlined, size: 16, color: Colors.orange),
                    label: const Text('Báo cáo địa điểm', style: TextStyle(fontSize: 12, color: Colors.orange, fontWeight: FontWeight.w600)),
                  ),
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: Text('Đóng', style: TextStyle(color: ColorConstants.textMuted)),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

}

