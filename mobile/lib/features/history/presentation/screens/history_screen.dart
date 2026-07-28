import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/constants/color_constants.dart';
import '../../../../core/di/di.dart';
import '../../../../core/session/session_controller.dart';
import '../../../../core/session/session_state.dart';
import '../../../../shared/widgtes/phone_call_widget.dart';
import '../../../../shared/widgtes/rating_dialog_widget.dart';
import '../../../rating/data/rating_repository.dart';
import '../providers/history_provider.dart';
import '../../models/history_model.dart';
import '../../../../core/utils/formatters.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  String _selectedFilter = "Tất cả";

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final session = getIt<SessionController>();
      final roleStr = session.role == UserRole.rescuer ? 'RESCUER' : 'VICTIM';
      context.read<HistoryProvider>().fetchHistory(roleStr);
    });
  }

  List<HistoryModel> _filterHistories(List<HistoryModel> list) {
    if (_selectedFilter == "Tất cả") return list;
    
    return list.where((item) {
      final status = item.status.toUpperCase();
      if (_selectedFilter == "Thành công") {
        return status == "DONE" || status == "COMPLETED";
      } else if (_selectedFilter == "Đang xử lý") {
        return ["PENDING", "SEARCHING", "ACCEPTED", "IN_PROGRESS", "ASSIGNED"].contains(status);
      } else if (_selectedFilter == "Thất bại / Hủy") {
        return status == "CANCELLED" || status == "FAILED";
      } else if (_selectedFilter == "Từ chối / Hết giờ") {
        return status == "REJECTED" || status == "TIMEOUT";
      }
      return true;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final session = getIt<SessionController>();
    final isRescuer = session.role == UserRole.rescuer;
    final roleStr = isRescuer ? 'RESCUER' : 'VICTIM';

    return Scaffold(
      backgroundColor: ColorConstants.backgroundLight,
      appBar: AppBar(
        backgroundColor: ColorConstants.surfaceWhite,
        elevation: 0,
        centerTitle: true,
        title: Text(
          isRescuer ? "LỊCH SỬ CA CỨU HỘ" : "LỊCH SỬ SOS ĐÃ GỬI",
          style: const TextStyle(
            color: ColorConstants.redRescue,
            fontWeight: FontWeight.w900,
            letterSpacing: 1.1,
          ),
        ),
      ),
      body: SafeArea(
        child: Consumer<HistoryProvider>(
          builder: (context, provider, _) {
            final filteredList = _filterHistories(provider.histories);

            return RefreshIndicator(
              onRefresh: () => provider.fetchHistory(roleStr),
              child: Column(
                children: [
                  // Header Stats Card
                  _buildStatsHeader(provider.histories),

                  // Filter Tabs
                  SizedBox(
                    height: 50,
                    child: ListView(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      children: [
                        _buildFilterChip("Tất cả"),
                        _buildFilterChip("Thành công"),
                        _buildFilterChip("Đang xử lý"),
                        _buildFilterChip("Thất bại / Hủy"),
                        if (isRescuer) _buildFilterChip("Từ chối / Hết giờ"),
                      ],
                    ),
                  ),

                  const SizedBox(height: 12),

                  // History List
                  Expanded(
                    child: provider.isLoading
                        ? const Center(child: CircularProgressIndicator())
                        : provider.errorMessage != null
                            ? Center(
                                child: Padding(
                                  padding: const EdgeInsets.all(32),
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Text(
                                        provider.errorMessage!,
                                        textAlign: TextAlign.center,
                                        style: const TextStyle(color: ColorConstants.textSecondary),
                                      ),
                                      const SizedBox(height: 16),
                                      ElevatedButton(
                                        onPressed: () => provider.fetchHistory(roleStr),
                                        child: const Text("Tải lại"),
                                      )
                                    ],
                                  ),
                                ),
                              )
                            : filteredList.isEmpty
                                ? const Center(
                                    child: Text(
                                      "Không tìm thấy lịch sử phù hợp.",
                                      style: TextStyle(color: ColorConstants.textSecondary),
                                    ),
                                  )
                                : ListView.builder(
                                    padding: const EdgeInsets.symmetric(horizontal: 16),
                                    itemCount: filteredList.length,
                                    itemBuilder: (context, index) {
                                      final item = filteredList[index];
                                      return _HistoryCard(
                                        item: item,
                                        isRescuer: isRescuer,
                                        formattedDate: Formatters.formatDateTime(item.date),
                                      );
                                    },
                                  ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildStatsHeader(List<HistoryModel> list) {
    int total = list.length;
    int success = list.where((item) => item.status == "DONE" || item.status == "COMPLETED").length;
    int active = list.where((item) => ["PENDING", "SEARCHING", "ACCEPTED", "IN_PROGRESS", "ASSIGNED"].contains(item.status.toUpperCase())).length;
    int failed = list.where((item) => ["CANCELLED", "FAILED", "REJECTED", "TIMEOUT"].contains(item.status.toUpperCase())).length;

    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: ColorConstants.redRescue,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: ColorConstants.redRescue.withOpacity(0.3),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _StatItem(label: "Tổng cộng", value: total.toString().padLeft(2, '0')),
          const _VerticalDivider(),
          _StatItem(label: "Thành công", value: success.toString().padLeft(2, '0')),
          const _VerticalDivider(),
          _StatItem(label: "Đang xử lý", value: active.toString().padLeft(2, '0')),
          const _VerticalDivider(),
          _StatItem(label: "Hủy / Lỗi", value: failed.toString().padLeft(2, '0')),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label) {
    final active = _selectedFilter == label;
    return Container(
      margin: const EdgeInsets.only(right: 8, bottom: 8, top: 8),
      child: FilterChip(
        label: Text(
          label,
          style: TextStyle(
            color: active ? Colors.white : ColorConstants.textSecondary,
            fontWeight: FontWeight.bold,
          ),
        ),
        selected: active,
        onSelected: (val) {
          setState(() {
            _selectedFilter = label;
          });
        },
        backgroundColor: ColorConstants.surfaceWhite,
        selectedColor: ColorConstants.redRescue,
        checkmarkColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(
            color: active ? ColorConstants.redRescue : Colors.transparent,
          ),
        ),
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String label;
  final String value;
  const _StatItem({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w500),
        ),
      ],
    );
  }
}

class _VerticalDivider extends StatelessWidget {
  const _VerticalDivider();
  @override
  Widget build(BuildContext context) {
    return Container(height: 28, width: 1, color: Colors.white24);
  }
}

class _HistoryCard extends StatelessWidget {
  final HistoryModel item;
  final bool isRescuer;
  final String formattedDate;

  const _HistoryCard({
    required this.item,
    required this.isRescuer,
    required this.formattedDate,
  });

  Color get statusColor {
    final status = item.status.toUpperCase();
    switch (status) {
      case "DONE":
      case "COMPLETED":
        return ColorConstants.success;
      case "CANCELLED":
      case "FAILED":
        return ColorConstants.orangeWarning;
      case "REJECTED":
      case "TIMEOUT":
        return ColorConstants.redRescue;
      case "ACCEPTED":
      case "IN_PROGRESS":
      case "ASSIGNED":
        return Colors.blue;
      default:
        return ColorConstants.textSecondary;
    }
  }

  String get statusText {
    final status = item.status.toUpperCase();
    switch (status) {
      case "DONE":
      case "COMPLETED":
        return "HOÀN THÀNH";
      case "CANCELLED":
      case "FAILED":
        return "THẤT BẠI / HỦY";
      case "REJECTED":
        return "ĐÃ TỪ CHỐI";
      case "TIMEOUT":
        return "HẾT GIỜ OFFER";
      case "ACCEPTED":
        return "ĐÃ CHẤP NHẬN";
      case "IN_PROGRESS":
        return "ĐANG ĐẾN CỨU HỘ";
      case "ASSIGNED":
        return "ĐÃ ĐIỀU PHỐI";
      case "PENDING":
      case "SEARCHING":
        return "ĐANG TÌM KIẾM";
      default:
        return status;
    }
  }

  @override
  Widget build(BuildContext context) {
    final hasValidLocation = item.victimLat != 0.0 && item.victimLng != 0.0;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: ColorConstants.surfaceWhite,
        borderRadius: BorderRadius.circular(16),
        border: Border(left: BorderSide(color: statusColor, width: 6)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    item.incidentType.toUpperCase(),
                    style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    statusText,
                    style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 10),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            _IconText(
              icon: Icons.location_on_outlined, 
              text: "Tọa độ: ${item.victimLat.toStringAsFixed(5)}, ${item.victimLng.toStringAsFixed(5)}", 
              color: ColorConstants.textPrimary,
            ),
            const SizedBox(height: 4),
            _IconText(
              icon: Icons.access_time, 
              text: formattedDate, 
              color: ColorConstants.textSecondary,
            ),

            // Minimap Preview (Vị trí nạn nhân trên minimap)
            if (hasValidLocation) ...[
              const SizedBox(height: 10),
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: SizedBox(
                  height: 120,
                  width: double.infinity,
                  child: FlutterMap(
                    options: MapOptions(
                      initialCenter: LatLng(item.victimLat, item.victimLng),
                      initialZoom: 14.5,
                      interactionOptions: const InteractionOptions(
                        flags: InteractiveFlag.none,
                      ),
                    ),
                    children: [
                      TileLayer(
                        urlTemplate: AppConstants.urlTemplateDefault,
                        userAgentPackageName: 'com.example.mobile',
                      ),
                      MarkerLayer(
                        markers: [
                          Marker(
                            point: LatLng(item.victimLat, item.victimLng),
                            width: 36,
                            height: 36,
                            alignment: Alignment.center,
                            child: Container(
                              decoration: const BoxDecoration(
                                color: ColorConstants.redRescue,
                                shape: BoxShape.circle,
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black26, 
                                    blurRadius: 4, 
                                    offset: Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: const Icon(
                                Icons.location_on,
                                color: Colors.white,
                                size: 22,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
            
            // Partner Information block
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 10),
              child: Divider(height: 1),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        isRescuer 
                            ? "Nạn nhân: ${item.partnerName ?? 'Không rõ'}"
                            : "Cứu hộ: ${item.partnerName ?? 'Đang tìm kiếm...'}",
                        style: const TextStyle(
                          color: ColorConstants.textPrimary, 
                          fontSize: 13, 
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      if (item.partnerPhone != null && item.partnerPhone!.isNotEmpty)
                        Text(
                          "SĐT: ${item.partnerPhone}",
                          style: const TextStyle(color: ColorConstants.textSecondary, fontSize: 12),
                        ),
                    ],
                  ),
                ),
                if (item.partnerPhone != null && item.partnerPhone!.isNotEmpty)
                  PhoneCallWidget(phoneNumber: item.partnerPhone!, size: 24),
              ],
            ),

            if (item.description.isNotEmpty) ...[
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 10),
                child: Divider(height: 1),
              ),
              Text(
                "Mô tả: ${item.description}",
                style: const TextStyle(color: ColorConstants.textSecondary, fontSize: 13, height: 1.4),
              ),
            ],
            
            if (item.cancelReason != null && item.cancelReason!.isNotEmpty) ...[
              const SizedBox(height: 6),
              Text(
                "Lý do hủy: ${item.cancelReason}",
                style: const TextStyle(color: Colors.redAccent, fontSize: 12, fontStyle: FontStyle.italic),
              ),
            ],

            if (!isRescuer && (item.status.toUpperCase() == "DONE" || item.status.toUpperCase() == "COMPLETED")) ...[
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: FutureBuilder<dynamic>(
                  future: getIt<RatingRepository>().getRatingBySosId(item.id),
                  builder: (context, snapshot) {
                    final ratingData = snapshot.data;
                    final ratingValue = _extractRatingValue(ratingData);
                    final hasRated = ratingValue != null;

                    return OutlinedButton.icon(
                      onPressed: snapshot.connectionState == ConnectionState.waiting
                          ? null
                          : () {
                              if (hasRated) {
                                RatingDialogWidget.show(
                                  context,
                                  sosRequestId: item.id,
                                  rescuerName: item.partnerName,
                                  existingRating: ratingData is Map<String, dynamic>
                                      ? ratingData
                                      : ratingData is Map
                                          ? Map<String, dynamic>.from(ratingData)
                                          : null,
                                  readOnly: true,
                                );
                              } else {
                                RatingDialogWidget.show(
                                  context,
                                  sosRequestId: item.id,
                                  rescuerName: item.partnerName,
                                );
                              }
                            },
                      style: OutlinedButton.styleFrom(
                        foregroundColor: hasRated ? Colors.grey.shade600 : Colors.amber.shade800,
                        side: BorderSide(
                          color: hasRated ? Colors.grey.shade400 : Colors.amber.shade700,
                          width: 1.5,
                        ),
                        backgroundColor: hasRated ? Colors.grey.shade100 : Colors.transparent,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        padding: const EdgeInsets.symmetric(vertical: 8),
                      ),
                      icon: Icon(
                        hasRated ? Icons.star_rate_rounded : Icons.star_rounded,
                        color: hasRated ? Colors.grey.shade600 : Colors.amber,
                        size: 20,
                      ),
                      label: Text(
                        hasRated
                            ? 'Đã đánh giá ${_buildStarText(ratingValue!)}'
                            : 'Đánh giá ca cứu hộ này',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                    );
                  },
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
  int? _extractRatingValue(dynamic ratingData) {
    if (ratingData == null) return null;
    if (ratingData is Map<String, dynamic>) {
      final value = ratingData['rating'] ?? ratingData['score'] ?? ratingData['stars'];
      if (value is num) return value.toInt();
      return int.tryParse(value?.toString() ?? '');
    }
    if (ratingData is Map) {
      final map = Map<String, dynamic>.from(ratingData);
      final value = map['rating'] ?? map['score'] ?? map['stars'];
      if (value is num) return value.toInt();
      return int.tryParse(value?.toString() ?? '');
    }
    return null;
  }

  String _buildStarText(int rating) {
    return '${'★' * rating}${'☆' * (5 - rating)}';
  }
}

class _IconText extends StatelessWidget {
  final IconData icon;
  final String text;
  final Color color;
  const _IconText({required this.icon, required this.text, required this.color});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 16, color: ColorConstants.redRescue),
        const SizedBox(width: 8),
        Expanded(child: Text(text, style: TextStyle(color: color, fontSize: 13, fontWeight: FontWeight.w500))),
      ],
    );
  }
}
