import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/constants/color_constants.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/di/di.dart';
import '../../../../core/location/data/location_service.dart';
import '../../../../core/session/session_controller.dart';
import '../../data/models/emergency_amenity_model.dart';
import '../providers/amenity_provider.dart';

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
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Vui lòng bật định vị GPS để vẽ tuyến đường chỉ đường!'),
            backgroundColor: Colors.orange,
          ),
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

  @override
  Widget build(BuildContext context) {
    final categoryTitle = amenity.categoryName ?? 'Tiện ích cộng đồng';

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: const BoxDecoration(
        color: ColorConstants.surfaceWhite,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[300],
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
                child: const Icon(
                  Icons.storefront_rounded,
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
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: ColorConstants.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Tọa độ: ${amenity.latitude.toStringAsFixed(4)}, ${amenity.longitude.toStringAsFixed(4)}',
                      style: const TextStyle(
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
              const Icon(Icons.access_time_rounded, size: 18, color: ColorConstants.textMuted),
              const SizedBox(width: 8),
              Text(
                'Giờ mở cửa: ${amenity.openingHours}',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: ColorConstants.textPrimary,
                ),
              ),
            ],
          ),
          if (amenity.phone != null && amenity.phone!.isNotEmpty) ...[
            const SizedBox(height: 10),
            Row(
              children: [
                const Icon(Icons.phone_rounded, size: 18, color: ColorConstants.textMuted),
                const SizedBox(width: 8),
                Text(
                  'SĐT liên hệ: ${amenity.phone}',
                  style: const TextStyle(
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
                label: const Text('Mở Google Maps ngoài', style: TextStyle(fontSize: 12, color: ColorConstants.secondary)),
              ),
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Đóng', style: TextStyle(color: ColorConstants.textMuted)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
