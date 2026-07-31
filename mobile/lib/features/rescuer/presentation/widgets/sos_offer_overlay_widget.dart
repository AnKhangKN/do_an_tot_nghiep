import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import '../../models/sos_offer_model.dart';

class SOSOfferOverlayWidget extends StatefulWidget {
  final SOSOfferModel sos;
  final Position? currentPosition;
  final VoidCallback onAccept;
  final VoidCallback onReject;
  final int timeoutSeconds;

  const SOSOfferOverlayWidget({
    super.key,
    required this.sos,
    required this.currentPosition,
    required this.onAccept,
    required this.onReject,
    this.timeoutSeconds = 30, // Mặc định 30 giây
  });

  @override
  State<SOSOfferOverlayWidget> createState() => _SOSOfferOverlayWidgetState();
}

class _SOSOfferOverlayWidgetState extends State<SOSOfferOverlayWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _progressController;
  String _distanceText = "Đang tính khoảng cách...";

  @override
  void initState() {
    super.initState();

    // 1. Khởi tạo thanh chạy thời gian đếm ngược
    _progressController = AnimationController(
      vsync: this,
      duration: Duration(seconds: widget.timeoutSeconds),
    )..addListener(() {
      setState(() {});
    })
      ..addStatusListener((status) {
        if (status == AnimationStatus.completed) {
          debugPrint("⏰ Hết thời gian nhận cuốc -> Tự động từ chối!");
          widget.onReject(); // Hết giờ thì tự động gọi hàm từ chối
        }
      });

    _progressController.forward();

    // 2. Tính khoảng cách từ Rescuer đến Nạn nhân
    _calculateDistance();
  }

  void _calculateDistance() {
    if (widget.currentPosition != null) {
      final distanceInMeters = Geolocator.distanceBetween(
        widget.currentPosition!.latitude,
        widget.currentPosition!.longitude,
        widget.sos.victimLat,
        widget.sos.victimLng,
      );

      setState(() {
        if (distanceInMeters < 1000) {
          _distanceText = "${distanceInMeters.toStringAsFixed(0)} m";
        } else {
          _distanceText = "${(distanceInMeters / 1000).toStringAsFixed(1)} km";
        }
      });
    }
  }

  @override
  void dispose() {
    _progressController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final int secondsLeft =
    (widget.timeoutSeconds * (1 - _progressController.value)).ceil();

    return Material(
      elevation: 16,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.red.shade600, width: 2),
          boxShadow: [
            BoxShadow(
              color: Colors.red.withValues(alpha: 0.2),
              blurRadius: 20,
              spreadRadius: 5,
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // --- HEADER KHẨN CẤP ---
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: Colors.red.shade600,
                borderRadius:
                const BorderRadius.vertical(top: Radius.circular(18)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.warning_amber_rounded,
                      color: Colors.white, size: 28),
                  const SizedBox(width: 8),
                  const Expanded(
                    child: Text(
                      "YÊU CẦU CỨU HỘ KHẨN CẤP",
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ),
                  Container(
                    padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      "${secondsLeft}s",
                      style: TextStyle(
                        color: Colors.red.shade600,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // --- THANH PROGRESS BAR ---
            LinearProgressIndicator(
              value: 1 - _progressController.value,
              backgroundColor: Colors.grey.shade200,
              color: Colors.red.shade600,
              minHeight: 4,
            ),

            // --- NỘI DUNG THÔNG TIN ---
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.location_on,
                          color: Colors.blue.shade700, size: 24),
                      const SizedBox(width: 8),
                      Text(
                        "Cách bạn: $_distanceText",
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.black87,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  // --- HIỂN THỊ LOẠI SỰ CỐ ---
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF3C7),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFFFCD34D)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.build_circle_rounded,
                            color: Color(0xFFD97706), size: 20),
                        const SizedBox(width: 8),
                        const Text(
                          "Sự cố: ",
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF92400E),
                          ),
                        ),
                        Expanded(
                          child: Text(
                            widget.sos.incidentTypeName ?? "Chưa xác định",
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF92400E),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 10),

                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.grey.shade300),
                    ),
                    child: Text(
                      widget.sos.description ?? "Nạn nhân không để lại mô tả",
                      style: const TextStyle(fontSize: 15, color: Colors.black87),
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  if (widget.sos.imageUrl != null && widget.sos.imageUrl!.isNotEmpty) ...[
                    const SizedBox(height: 10),
                    GestureDetector(
                      behavior: HitTestBehavior.opaque,
                      onTap: () {
                        showDialog(
                          context: context,
                          useRootNavigator: true,
                          builder: (ctx) => Dialog.fullscreen(
                            backgroundColor: Colors.black,
                            child: Stack(
                              children: [
                                Center(
                                  child: InteractiveViewer(
                                    minScale: 0.5,
                                    maxScale: 4.0,
                                    child: Image.network(
                                      widget.sos.imageUrl!,
                                      fit: BoxFit.contain,
                                      loadingBuilder: (c, child, progress) {
                                        if (progress == null) return child;
                                        return const Center(
                                          child: CircularProgressIndicator(color: Colors.white),
                                        );
                                      },
                                      errorBuilder: (c, e, s) => const Center(
                                        child: Text(
                                          "Không thể tải ảnh hiện trường",
                                          style: TextStyle(color: Colors.white70),
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                                Positioned(
                                  top: MediaQuery.of(ctx).padding.top + 12,
                                  left: 16,
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: Colors.black54,
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: const Text(
                                      "Ảnh hiện trường nạn nhân",
                                      style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
                                    ),
                                  ),
                                ),
                                Positioned(
                                  top: MediaQuery.of(ctx).padding.top + 8,
                                  right: 16,
                                  child: IconButton(
                                    icon: const Icon(Icons.close, color: Colors.white, size: 28),
                                    onPressed: () => Navigator.pop(ctx),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Stack(
                          children: [
                            Image.network(
                              widget.sos.imageUrl!,
                              height: 140,
                              width: double.infinity,
                              fit: BoxFit.cover,
                              errorBuilder: (c, e, s) => const SizedBox.shrink(),
                            ),
                            Positioned(
                              bottom: 8,
                              right: 8,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.black.withValues(alpha: 0.7),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(Icons.zoom_in, color: Colors.white, size: 14),
                                    SizedBox(width: 4),
                                    Text(
                                      'Chạm để xem ảnh toàn màn hình',
                                      style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                  const SizedBox(height: 20),


                  // --- NÚT HÀNH ĐỘNG ---
                  Row(
                    children: [
                      // Nút từ chối
                      Expanded(
                        flex: 2,
                        child: OutlinedButton(
                          onPressed: widget.onReject,
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            side: BorderSide(color: Colors.grey.shade400),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: const Text(
                            "BỎ QUA",
                            style: TextStyle(
                                color: Colors.black54,
                                fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      // Nút chấp nhận
                      Expanded(
                        flex: 3,
                        child: ElevatedButton(
                          onPressed: widget.onAccept,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.red.shade600,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            elevation: 4,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: const Text(
                            "NHẬN CỨU HỘ",
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
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
    );
  }
}