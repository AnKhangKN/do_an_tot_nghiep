import 'package:flutter/material.dart';

/// Widget vẽ logo 4 màu chuẩn chính thức của Google (Official 4-color Google 'G' Logo)
class GoogleLogoWidget extends StatelessWidget {
  final double size;

  const GoogleLogoWidget({super.key, this.size = 24.0});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: _GoogleLogoPainter(),
      ),
    );
  }
}

class _GoogleLogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final scale = size.width / 48.0;
    canvas.scale(scale, scale);

    // 1. Xanh dương - Blue (#4285F4)
    final bluePaint = Paint()
      ..color = const Color(0xFF4285F4)
      ..style = PaintingStyle.fill
      ..isAntiAlias = true;

    final bluePath = Path()
      ..moveTo(46.12, 24.5)
      ..cubicTo(46.12, 22.84, 45.97, 21.25, 45.69, 19.72)
      ..lineTo(24.0, 19.72)
      ..lineTo(24.0, 28.51)
      ..lineTo(36.41, 28.51)
      ..cubicTo(35.88, 31.37, 34.27, 33.79, 31.85, 35.41)
      ..lineTo(31.85, 41.15)
      ..lineTo(39.24, 41.15)
      ..cubicTo(43.56, 37.17, 46.12, 31.3, 46.12, 24.5)
      ..close();
    canvas.drawPath(bluePath, bluePaint);

    // 2. Xanh lá - Green (#34A853)
    final greenPaint = Paint()
      ..color = const Color(0xFF34A853)
      ..style = PaintingStyle.fill
      ..isAntiAlias = true;

    final greenPath = Path()
      ..moveTo(24.0, 47.0)
      ..cubicTo(30.21, 47.0, 35.42, 44.94, 39.24, 41.15)
      ..lineTo(31.85, 35.41)
      ..cubicTo(29.8, 36.78, 27.13, 37.6, 24.0, 37.6)
      ..cubicTo(17.98, 37.6, 12.89, 33.54, 11.07, 28.07)
      ..lineTo(3.44, 28.07)
      ..lineTo(3.44, 34.02)
      ..cubicTo(7.27, 41.62, 15.1, 47.0, 24.0, 47.0)
      ..close();
    canvas.drawPath(greenPath, greenPaint);

    // 3. Vàng - Yellow (#FBBC05)
    final yellowPaint = Paint()
      ..color = const Color(0xFFFBBC05)
      ..style = PaintingStyle.fill
      ..isAntiAlias = true;

    final yellowPath = Path()
      ..moveTo(11.07, 28.07)
      ..cubicTo(10.61, 26.69, 10.35, 25.22, 10.35, 23.7)
      ..cubicTo(10.35, 22.18, 10.61, 20.71, 11.07, 19.33)
      ..lineTo(11.07, 13.38)
      ..lineTo(3.44, 13.38)
      ..cubicTo(1.87, 16.48, 0.98, 19.98, 0.98, 23.7)
      ..cubicTo(0.98, 27.42, 1.87, 30.92, 3.44, 34.02)
      ..lineTo(11.07, 28.07)
      ..close();
    canvas.drawPath(yellowPath, yellowPaint);

    // 4. Đỏ - Red (#EA4335)
    final redPaint = Paint()
      ..color = const Color(0xFFEA4335)
      ..style = PaintingStyle.fill
      ..isAntiAlias = true;

    final redPath = Path()
      ..moveTo(24.0, 9.8)
      ..cubicTo(27.38, 9.8, 30.41, 10.96, 32.79, 13.23)
      ..lineTo(39.41, 6.61)
      ..cubicTo(35.41, 2.88, 30.21, 0.6, 24.0, 0.6)
      ..cubicTo(15.1, 0.6, 7.27, 5.98, 3.44, 13.38)
      ..lineTo(11.07, 19.33)
      ..cubicTo(12.89, 13.86, 17.98, 9.8, 24.0, 9.8)
      ..close();
    canvas.drawPath(redPath, redPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
