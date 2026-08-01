import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../core/constants/color_constants.dart';
import '../../data/models/emergency_amenity_model.dart';
import '../providers/amenity_provider.dart';

class MyAmenitiesScreen extends StatefulWidget {
  const MyAmenitiesScreen({super.key});

  @override
  State<MyAmenitiesScreen> createState() => _MyAmenitiesScreenState();
}

class _MyAmenitiesScreenState extends State<MyAmenitiesScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      if (mounted) {
        context.read<AmenityProvider>().fetchMyAmenities();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ColorConstants.backgroundLight,
      appBar: AppBar(
        title: const Text(
          'Điểm tiện ích đã tạo',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
        backgroundColor: ColorConstants.surfaceWhite,
        foregroundColor: ColorConstants.textPrimary,
        elevation: 0.5,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              context.read<AmenityProvider>().fetchMyAmenities();
            },
          ),
        ],
      ),
      body: Consumer<AmenityProvider>(
        builder: (context, provider, child) {
          if (provider.isLoadingMyAmenities) {
            return Center(
              child: CircularProgressIndicator(color: ColorConstants.redRescue),
            );
          }

          final amenities = provider.myAmenities;

          if (amenities.isEmpty) {
            return _buildEmptyState();
          }

          return RefreshIndicator(
            color: ColorConstants.redRescue,
            onRefresh: () => provider.fetchMyAmenities(),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: amenities.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final amenity = amenities[index];
                return _buildAmenityItemCard(amenity);
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.medical_services_outlined,
              size: 72,
              color: ColorConstants.textSecondary.withOpacity(0.4),
            ),
            const SizedBox(height: 16),
            Text(
              'Chưa có điểm tiện ích nào',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: ColorConstants.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Các điểm tiện ích khẩn cấp do bạn đóng góp sẽ hiển thị ở đây.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                color: ColorConstants.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAmenityItemCard(EmergencyAmenityModel amenity) {
    final statusColor = _getStatusColor(amenity.status);
    final statusText = _getStatusText(amenity.status);

    return Container(
      decoration: BoxDecoration(
        color: ColorConstants.surfaceWhite,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () => _showAmenityDetailDialog(amenity),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Ảnh tiện ích hoặc Icon mặc định
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: amenity.imageUrl != null && amenity.imageUrl!.isNotEmpty
                      ? Image.network(
                          amenity.imageUrl!,
                          width: 64,
                          height: 64,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => _buildDefaultAmenityIcon(),
                        )
                      : _buildDefaultAmenityIcon(),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              amenity.categoryName ?? 'Tiện ích khẩn cấp',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                                color: ColorConstants.textPrimary,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 8),
                          _buildChip(text: statusText, color: statusColor),
                        ],
                      ),
                      const SizedBox(height: 6),
                      if (amenity.phone != null && amenity.phone!.isNotEmpty) ...[
                        Row(
                          children: [
                            Icon(Icons.phone_outlined, size: 14, color: ColorConstants.textSecondary),
                            const SizedBox(width: 4),
                            Text(
                              amenity.phone!,
                              style: TextStyle(
                                fontSize: 13,
                                color: ColorConstants.textSecondary,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                      ],
                      Row(
                        children: [
                          Icon(Icons.access_time_rounded, size: 14, color: ColorConstants.textSecondary),
                          const SizedBox(width: 4),
                          Text(
                            amenity.openingHours,
                            style: TextStyle(
                              fontSize: 13,
                              color: ColorConstants.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDefaultAmenityIcon() {
    return Container(
      width: 64,
      height: 64,
      color: ColorConstants.redRescue.withOpacity(0.1),
      child: const Icon(
        Icons.medical_services_outlined,
        color: ColorConstants.redRescue,
        size: 32,
      ),
    );
  }

  void _showAmenityDetailDialog(EmergencyAmenityModel amenity) {
    final statusColor = _getStatusColor(amenity.status);
    final statusText = _getStatusText(amenity.status);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          decoration: BoxDecoration(
            color: ColorConstants.surfaceWhite,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          ),
          padding: const EdgeInsets.all(24),
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
              const SizedBox(height: 20),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: amenity.imageUrl != null && amenity.imageUrl!.isNotEmpty
                        ? Image.network(
                            amenity.imageUrl!,
                            width: 56,
                            height: 56,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => _buildDefaultAmenityIcon(),
                          )
                        : _buildDefaultAmenityIcon(),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          amenity.categoryName ?? 'Tiện ích khẩn cấp',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                            color: ColorConstants.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 6),
                        _buildChip(text: statusText, color: statusColor),
                      ],
                    ),
                  ),
                ],
              ),
              const Divider(height: 32),
              _buildDetailItem(
                icon: Icons.phone_outlined,
                title: 'Số điện thoại liên hệ',
                content: amenity.phone != null && amenity.phone!.isNotEmpty
                    ? amenity.phone!
                    : 'Không có số điện thoại',
              ),
              const SizedBox(height: 14),
              _buildDetailItem(
                icon: Icons.access_time_rounded,
                title: 'Giờ mở cửa',
                content: amenity.openingHours,
              ),
              const SizedBox(height: 14),
              _buildDetailItem(
                icon: Icons.my_location_rounded,
                title: 'Tọa độ GPS',
                content: '${amenity.latitude.toStringAsFixed(6)}, ${amenity.longitude.toStringAsFixed(6)}',
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ColorConstants.redRescue,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onPressed: () => Navigator.pop(context),
                  child: const Text(
                    'ĐÓNG',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDetailItem({
    required IconData icon,
    required String title,
    required String content,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 20, color: ColorConstants.textSecondary),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: ColorConstants.textSecondary,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                content,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: ColorConstants.textPrimary,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildChip({
    required String text,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'APPROVED':
        return ColorConstants.success;
      case 'REJECTED':
        return ColorConstants.redRescue;
      case 'PENDING':
      default:
        return const Color(0xFFF57C00); // Orange
    }
  }

  String _getStatusText(String status) {
    switch (status.toUpperCase()) {
      case 'APPROVED':
        return 'Đã duyệt';
      case 'REJECTED':
        return 'Từ chối';
      case 'PENDING':
      default:
        return 'Chờ duyệt';
    }
  }
}
