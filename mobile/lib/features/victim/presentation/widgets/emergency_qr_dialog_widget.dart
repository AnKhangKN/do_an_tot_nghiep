import 'dart:io';
import 'dart:typed_data';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../../../core/constants/color_constants.dart';
import '../../../../core/utils/app_snackbar.dart';

class EmergencyQRDialogWidget extends StatelessWidget {
  final String sosRequestId;
  final String? phone;
  final String? incidentTypeName;
  final double? lat;
  final double? lng;

  const EmergencyQRDialogWidget({
    super.key,
    required this.sosRequestId,
    this.phone,
    this.incidentTypeName,
    this.lat,
    this.lng,
  });

  static void show(
    BuildContext context, {
    required String sosRequestId,
    String? phone,
    String? incidentTypeName,
    double? lat,
    double? lng,
  }) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => EmergencyQRDialogWidget(
        sosRequestId: sosRequestId,
        phone: phone,
        incidentTypeName: incidentTypeName,
        lat: lat,
        lng: lng,
      ),
    );
  }

  Future<Uint8List> _generateQrPng(String data) async {
    final painter = QrPainter(
      data: data,
      version: QrVersions.auto,
      eyeStyle: const QrEyeStyle(
        eyeShape: QrEyeShape.square,
        color: Colors.black,
      ),
      dataModuleStyle: const QrDataModuleStyle(
        dataModuleShape: QrDataModuleShape.square,
        color: Colors.black,
      ),
      emptyColor: Colors.white,
    );

    final picRecorder = ui.PictureRecorder();
    final canvas = Canvas(picRecorder);
    const size = 600.0;

    final bgPaint = Paint()..color = Colors.white;
    canvas.drawRect(const Rect.fromLTWH(0, 0, size, size), bgPaint);

    painter.paint(canvas, const Size(size, size));

    final picture = picRecorder.endRecording();
    final img = await picture.toImage(size.toInt(), size.toInt());
    final byteData = await img.toByteData(format: ui.ImageByteFormat.png);
    return byteData!.buffer.asUint8List();
  }

  Future<void> _saveQrImage(BuildContext context) async {
    try {
      final bytes = await _generateQrPng(sosRequestId.trim());

      Directory? targetDir;
      if (Platform.isAndroid) {
        final downloadDir = Directory('/storage/emulated/0/Download');
        if (await downloadDir.exists()) {
          targetDir = downloadDir;
        } else {
          final picturesDir = Directory('/storage/emulated/0/Pictures');
          if (await picturesDir.exists()) {
            targetDir = picturesDir;
          }
        }
      }

      final shortId = sosRequestId.length > 8 ? sosRequestId.substring(0, 8) : sosRequestId;
      final fileName = 'QR_CuuHo_$shortId.png';

      File file;
      if (targetDir != null) {
        file = File('${targetDir.path}/$fileName');
      } else {
        final tempDir = Directory.systemTemp;
        file = File('${tempDir.path}/$fileName');
      }

      await file.writeAsBytes(bytes);

      if (!context.mounted) return;

      AppSnackBar.show(
        context,
        'Đã tải ảnh QR về máy:\n${file.path}',
        type: AppSnackBarType.success,
        duration: const Duration(seconds: 4),
      );
    } catch (e) {
      debugPrint("❌ [QR SAVE] Lỗi lưu ảnh QR: $e");
      if (!context.mounted) return;
      AppSnackBar.show(
        context,
        'Không thể tải ảnh QR: $e',
        type: AppSnackBarType.error,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final qrData = sosRequestId.trim();

    return Container(
      padding: const EdgeInsets.all(24.0),
      decoration: BoxDecoration(
        color: ColorConstants.surfaceWhite,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28.0)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag indicator
          Container(
            width: 40,
            height: 4,
            margin: const EdgeInsets.only(bottom: 20),
            decoration: BoxDecoration(
              color: ColorConstants.borderDark,
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Header
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(
                  Icons.qr_code_2_rounded,
                  color: Colors.redAccent,
                  size: 28,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Mã QR Cứu Hộ Khẩn Cấp',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: ColorConstants.textPrimary,
                      ),
                    ),
                    Text(
                      'Mã ca: #${sosRequestId.length > 8 ? sosRequestId.substring(0, 8) : sosRequestId}',
                      style: TextStyle(
                        fontSize: 12,
                        color: ColorConstants.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 20),

          // QR Code container
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: ColorConstants.surfaceWhite,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: ColorConstants.border, width: 2),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 16,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: QrImageView(
              data: qrData,
              version: QrVersions.auto,
              size: 220.0,
              eyeStyle: const QrEyeStyle(
                eyeShape: QrEyeShape.square,
                color: Colors.black87,
              ),
              dataModuleStyle: const QrDataModuleStyle(
                dataModuleShape: QrDataModuleShape.square,
                color: Colors.black87,
              ),
            ),
          ),

          const SizedBox(height: 18),

          // Download QR Image Button
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () => _saveQrImage(context),
              icon: const Icon(Icons.download_rounded, size: 20),
              label: const Text(
                'Tải hình ảnh QR về máy',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
              ),
              style: OutlinedButton.styleFrom(
                foregroundColor: const Color(0xFF9333EA),
                side: const BorderSide(color: Color(0xFFC084FC), width: 1.5),
                backgroundColor: const Color(0xFFFAF5FF),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
            ),
          ),

          const SizedBox(height: 14),

          // Instruction card
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.amber.shade50,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.amber.shade200),
            ),
            child: Row(
              children: [
                Icon(Icons.info_outline_rounded, color: Colors.amber.shade800, size: 20),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Đưa màn hình này cho Cứu hộ viên quét trực tiếp hoặc tải ảnh QR về máy để gửi qua Zalo, Messenger, SMS.',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: Colors.amber.shade900,
                      height: 1.3,
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Close button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.grey.shade900,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                elevation: 0,
              ),
              child: const Text(
                'Đóng mã QR',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
