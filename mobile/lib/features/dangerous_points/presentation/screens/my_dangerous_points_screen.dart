import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../core/constants/color_constants.dart';
import '../../../../core/dangerous_points/models/dangerous_point_model.dart';
import '../providers/geofence_provider.dart';

class MyDangerousPointsScreen extends StatefulWidget {
  const MyDangerousPointsScreen({super.key});

  @override
  State<MyDangerousPointsScreen> createState() => _MyDangerousPointsScreenState();
}

class _MyDangerousPointsScreenState extends State<MyDangerousPointsScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      if (mounted) {
        context.read<GeofenceProvider>().fetchMyPoints();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ColorConstants.backgroundLight,
      appBar: AppBar(
        title: const Text(
          'Điểm cảnh báo đã tạo',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
        backgroundColor: ColorConstants.surfaceWhite,
        foregroundColor: ColorConstants.textPrimary,
        elevation: 0.5,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              context.read<GeofenceProvider>().fetchMyPoints();
            },
          ),
        ],
      ),
      body: Consumer<GeofenceProvider>(
        builder: (context, provider, child) {
          if (provider.isLoadingMyPoints) {
            return Center(
              child: CircularProgressIndicator(color: ColorConstants.redRescue),
            );
          }

          final points = provider.myPoints;

          if (points.isEmpty) {
            return _buildEmptyState();
          }

          return RefreshIndicator(
            color: ColorConstants.redRescue,
            onRefresh: () => provider.fetchMyPoints(),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: points.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final point = points[index];
                return _buildPointItemCard(point);
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
              Icons.warning_amber_rounded,
              size: 72,
              color: ColorConstants.textSecondary.withOpacity(0.4),
            ),
            const SizedBox(height: 16),
            Text(
              'Chưa có điểm cảnh báo nào',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: ColorConstants.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Các điểm cảnh báo nguy hiểm do bạn đóng góp sẽ được danh sách ở đây.',
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

  Widget _buildPointItemCard(DangerousPointModel point) {
    final statusColor = _getStatusColor(point.status);
    final statusText = _getStatusText(point.status);
    final dangerColor = _getDangerLevelColor(point.dangerLevel);
    final dangerText = _getDangerLevelText(point.dangerLevel);

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
          onTap: () => _showPointDetailDialog(point),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: dangerColor.withOpacity(0.12),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.warning_rounded,
                        color: dangerColor,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        point.zoneName,
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          color: ColorConstants.textPrimary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    _buildChip(
                      text: statusText,
                      color: statusColor,
                    ),
                  ],
                ),
                if (point.address != null && point.address!.isNotEmpty) ...[
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Icon(Icons.location_on_outlined, size: 16, color: ColorConstants.textSecondary),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          point.address!,
                          style: TextStyle(
                            fontSize: 13,
                            color: ColorConstants.textSecondary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ],
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildChip(
                      text: dangerText,
                      color: dangerColor,
                      isOutlined: true,
                    ),
                    Text(
                      _formatDate(point.createdAt),
                      style: TextStyle(
                        fontSize: 12,
                        color: ColorConstants.textSecondary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showPointDetailDialog(DangerousPointModel point) {
    final statusColor = _getStatusColor(point.status);
    final statusText = _getStatusText(point.status);
    final dangerColor = _getDangerLevelColor(point.dangerLevel);
    final dangerText = _getDangerLevelText(point.dangerLevel);

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
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: dangerColor.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(Icons.warning_amber_rounded, color: dangerColor, size: 28),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          point.zoneName,
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                            color: ColorConstants.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            _buildChip(text: statusText, color: statusColor),
                            const SizedBox(width: 8),
                            _buildChip(text: dangerText, color: dangerColor, isOutlined: true),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const Divider(height: 32),
              if (point.address != null && point.address!.isNotEmpty) ...[
                _buildDetailItem(
                  icon: Icons.location_on_outlined,
                  title: 'Địa chỉ',
                  content: point.address!,
                ),
                const SizedBox(height: 14),
              ],
              _buildDetailItem(
                icon: Icons.my_location_rounded,
                title: 'Tọa độ GPS',
                content: '${point.latitude.toStringAsFixed(6)}, ${point.longitude.toStringAsFixed(6)}',
              ),
              const SizedBox(height: 14),
              _buildDetailItem(
                icon: Icons.notes_outlined,
                title: 'Mô tả chi tiết',
                content: point.description != null && point.description!.isNotEmpty
                    ? point.description!
                    : 'Không có mô tả thêm',
              ),
              const SizedBox(height: 14),
              _buildDetailItem(
                icon: Icons.access_time_rounded,
                title: 'Thời gian đóng góp',
                content: _formatFullDate(point.createdAt),
              ),
              if (point.imageUrl != null && point.imageUrl!.isNotEmpty) ...[
                const SizedBox(height: 14),
                Text(
                  'Hình ảnh chứng minh thực tế',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: ColorConstants.textSecondary,
                  ),
                ),
                const SizedBox(height: 6),
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.network(
                    point.imageUrl!,
                    height: 160,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      height: 100,
                      decoration: BoxDecoration(
                        color: Colors.grey[200],
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Center(child: Icon(Icons.broken_image_rounded, color: Colors.grey)),
                    ),
                  ),
                ),
              ],
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
    bool isOutlined = false,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: isOutlined ? Colors.transparent : color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(20),
        border: isOutlined ? Border.all(color: color, width: 1) : null,
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

  Color _getDangerLevelColor(String level) {
    switch (level.toUpperCase()) {
      case 'HIGH':
        return ColorConstants.redRescue;
      case 'MEDIUM':
        return const Color(0xFFF57C00);
      case 'LOW':
      default:
        return ColorConstants.success;
    }
  }

  String _getDangerLevelText(String level) {
    switch (level.toUpperCase()) {
      case 'HIGH':
        return 'Rất nguy hiểm';
      case 'MEDIUM':
        return 'Nguy hiểm TB';
      case 'LOW':
      default:
        return 'Mức độ thấp';
    }
  }

  String _formatDate(DateTime dt) {
    return '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year}';
  }

  String _formatFullDate(DateTime dt) {
    return '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')} - ${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year}';
  }
}
