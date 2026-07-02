import 'package:flutter/material.dart';

class GoOnlineButtonWidget extends StatelessWidget {
  final bool isOnline;
  final bool isProcessing; // Thêm biến này nhận từ Controller xuống
  final VoidCallback onTap;

  const GoOnlineButtonWidget({
    super.key,
    required this.isOnline,
    required this.isProcessing,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      // Nếu đang xử lý (isProcessing = true) thì gán onTap = null (khóa hoàn toàn nút)
      onTap: isProcessing ? null : onTap,
      child: AnimatedOpacity(
        duration: const Duration(milliseconds: 200),
        opacity: isProcessing ? 0.6 : 1.0, // Làm mờ nhẹ nút khi đang khóa
        child: Container(
          height: 52,
          padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
          decoration: BoxDecoration(
            color: isOnline ? Colors.green : Colors.black,
            borderRadius: BorderRadius.circular(26),
            // ... boxShadow giữ nguyên ...
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 34,
                height: 34,
                decoration: const BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                ),
                child: isProcessing
                    ? const Padding(
                  padding: EdgeInsets.all(8.0),
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(Colors.grey),
                  ),
                )
                    : Icon(
                  Icons.power_settings_new,
                  color: isOnline ? Colors.green : Colors.black,
                  size: 20,
                ),
              ),
              if (!isOnline) ...[
                const SizedBox(width: 10),
                Text(
                  isProcessing ? "Đang kết nối..." : "Bật kết nối",
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}