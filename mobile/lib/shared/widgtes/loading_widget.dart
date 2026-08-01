import 'package:flutter/material.dart';
import '../../core/constants/color_constants.dart';

class LoadingWidget extends StatefulWidget {
  const LoadingWidget({super.key});

  @override
  State<LoadingWidget> createState() => _LoadingWidgetState();
}

class _LoadingWidgetState extends State<LoadingWidget> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    // Tạo vòng lặp vô hạn cho hiệu ứng radar sóng âm
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final primaryColor = theme.primaryColor; // Hoặc Colors.blue / Colors.red tùy app bạn

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // 🚀 Hiệu ứng Radar Sóng Âm Động
          AnimatedBuilder(
            animation: _controller,
            builder: (context, child) {
              return Stack(
                alignment: Alignment.center,
                children: [
                  // Lớp sóng ngoài cùng (Lan tỏa rộng nhất, mờ nhất)
                  _buildRipple(
                    radius: 120 * _controller.value,
                    opacity: (1.0 - _controller.value).clamp(0.0, 0.15),
                    color: primaryColor,
                  ),
                  // Lớp sóng thứ hai
                  _buildRipple(
                    radius: 80 * _controller.value,
                    opacity: (1.0 - _controller.value).clamp(0.0, 0.3),
                    color: primaryColor,
                  ),
                  // Tâm hình tròn cứng ở giữa chứa Icon
                  Container(
                    width: 54,
                    height: 54,
                    decoration: BoxDecoration(
                      color: primaryColor,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: primaryColor.withOpacity(0.4),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        )
                      ],
                    ),
                    child: const Icon(
                      Icons.location_searching_rounded, // Hoặc Icons.explore, Icons.gavel...
                      color: Colors.white,
                      size: 26,
                    ),
                  ),
                ],
              );
            },
          ),
          const SizedBox(height: 28),

          // 🚀 Dòng chữ Loading thiết kế tinh giản, hiện đại
          Text(
            'Đang tải dữ liệu...',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w600,
              color: ColorConstants.textPrimary,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Vui lòng chờ trong giây lát',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w400,
              color: ColorConstants.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  // Hàm helper để vẽ các vòng tròn sóng lan tỏa
  Widget _buildRipple({required double radius, required double opacity, required Color color}) {
    return Container(
      width: radius,
      height: radius,
      decoration: BoxDecoration(
        color: color.withOpacity(opacity),
        shape: BoxShape.circle,
      ),
    );
  }
}