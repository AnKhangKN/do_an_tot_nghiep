import 'package:flutter/material.dart';

class GoOnlineButtonWidget extends StatelessWidget {
  final bool isOnline;
  final VoidCallback onTap;

  const GoOnlineButtonWidget({
    super.key,
    required this.isOnline,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 52,
        padding: const EdgeInsets.symmetric(
          horizontal: 9,
          vertical: 6,
        ),
        decoration: BoxDecoration(
          color: isOnline ? Colors.green : Colors.black,
          borderRadius: BorderRadius.circular(26),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.2),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
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
              child: Icon(
                Icons.power_settings_new,
                color: isOnline ? Colors.green : Colors.black,
                size: 20,
              ),
            ),

            if (!isOnline) ...[
              const SizedBox(width: 10),
              const Text(
                "Bật kết nối",
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ],
        )
      ),
    );
  }
}