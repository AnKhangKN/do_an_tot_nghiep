import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../../../core/di/di.dart';
import '../../../../core/utils/app_snackbar.dart';
import '../../data/rescuer_repository.dart';
import '../../models/sos_offer_model.dart';
import '../providers/sos_provider.dart';

class QRScannerScreen extends StatefulWidget {
  const QRScannerScreen({super.key});

  @override
  State<QRScannerScreen> createState() => _QRScannerScreenState();
}

class _QRScannerScreenState extends State<QRScannerScreen> {
  final MobileScannerController _controller = MobileScannerController();
  bool _isProcessing = false;

  Future<void> _pickImageFromGallery() async {
    if (_isProcessing) return;

    try {
      final ImagePicker picker = ImagePicker();
      final XFile? image = await picker.pickImage(source: ImageSource.gallery);

      if (image != null) {
        debugPrint("🟢 [QR SCANNER] Đã chọn ảnh từ thư viện: ${image.path}");
        final BarcodeCapture? capture = await _controller.analyzeImage(image.path);

        if (capture != null && capture.barcodes.isNotEmpty) {
          _onDetect(capture);
        } else {
          if (!mounted) return;
          AppSnackBar.show(
            context,
            'Không tìm thấy mã QR cứu hộ hợp lệ trong ảnh!',
            type: AppSnackBarType.warning,
          );
        }
      }
    } catch (e) {
      debugPrint("❌ [QR SCANNER] Lỗi đọc QR từ thư viện ảnh: $e");
      if (!mounted) return;
      AppSnackBar.show(
        context,
        'Không thể đọc hình ảnh. Vui lòng chọn ảnh khác!',
        type: AppSnackBarType.error,
      );
    }
  }

  // Hàm hiển thị thông báo lỗi giao diện đẹp, thân thiện với người dùng
  void _showErrorDialog({required String title, required String message}) {
    if (!mounted) return;
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            const Icon(Icons.warning_amber_rounded, color: Colors.orange, size: 28),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                title,
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        content: Text(
          message,
          style: const TextStyle(fontSize: 14, height: 1.4, color: Colors.black87),
        ),
        actions: [
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              if (mounted) {
                setState(() => _isProcessing = false);
                _controller.start();
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.redAccent,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            ),
            child: const Text('Thử lại', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _onDetect(BarcodeCapture capture) async {
    if (_isProcessing) return;

    final List<Barcode> barcodes = capture.barcodes;
    for (final barcode in barcodes) {
      final String? rawValue = barcode.rawValue;
      if (rawValue == null || rawValue.trim().isEmpty) continue;

      final String cleanValue = rawValue.trim();
      String? sosRequestId;

      try {
        if (cleanValue.startsWith('{') && cleanValue.endsWith('}')) {
          final Map<String, dynamic> data = jsonDecode(cleanValue);
          sosRequestId = data['sosRequestId']?.toString();
        } else if (cleanValue.length >= 20) {
          sosRequestId = cleanValue;
        }
      } catch (e) {
        debugPrint("❌ [QR SCANNER] Lỗi parse QR: $e");
      }

      if (sosRequestId == null || sosRequestId.isEmpty) {
        if (!mounted) return;
        AppSnackBar.show(
          context,
          'Mã QR không hợp lệ hoặc sai định dạng!',
          type: AppSnackBarType.error,
          duration: const Duration(seconds: 4),
        );
        return;
      }

      setState(() => _isProcessing = true);
      _controller.stop();
      await _handleAcceptSOS(sosRequestId);
      break;
    }
  }

  Future<void> _handleAcceptSOS(String sosRequestId) async {
    try {
      final rescuerRepo = getIt<RescuerRepository>();
      final result = await rescuerRepo.acceptSosByQr(sosRequestId);

      if (!mounted) return;

      final data = result['data'];
      if (data != null && data['victim'] != null) {
        final victimMap = Map<String, dynamic>.from(data['victim']);
        final sosOffer = SOSOfferModel(
          sosId: sosRequestId,
          victimLat: victimMap['lat'] != null ? (victimMap['lat'] as num).toDouble() : 0.0,
          victimLng: victimMap['lng'] != null ? (victimMap['lng'] as num).toDouble() : 0.0,
          description: victimMap['description'],
          incidentTypeName: victimMap['incidentTypeName'],
        );
        getIt<SOSProvider>().startRescue(sosOffer, victimMap);
      }

      AppSnackBar.show(
        context,
        result['message'] ?? 'Tiếp nhận ca cứu hộ thành công!',
        type: AppSnackBarType.success,
      );

      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;

      String errorMessage = 'Không thể tiếp nhận ca cứu hộ. Vui lòng thử lại!';
      if (e is DioException) {
        final respData = e.response?.data;
        if (respData is Map && respData['message'] != null && respData['message'].toString().trim().isNotEmpty) {
          errorMessage = respData['message'].toString().trim();
        }
      }

      _showErrorDialog(
        title: 'Thông báo cứu hộ',
        message: errorMessage,
      );
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text(
          'Quét Mã QR Cứu Hộ',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            tooltip: 'Tải ảnh từ thư viện',
            icon: const Icon(Icons.photo_library_rounded, color: Colors.white),
            onPressed: _pickImageFromGallery,
          ),
          IconButton(
            tooltip: 'Bật/Tắt Flash',
            icon: ValueListenableBuilder(
              valueListenable: _controller,
              builder: (context, state, child) {
                return Icon(
                  state.torchState == TorchState.on
                      ? Icons.flash_on_rounded
                      : Icons.flash_off_rounded,
                  color: Colors.amber,
                );
              },
            ),
            onPressed: () => _controller.toggleTorch(),
          ),
        ],
      ),
      body: Stack(
        children: [
          MobileScanner(
            controller: _controller,
            onDetect: _onDetect,
          ),

          // Overlay khung quét
          Center(
            child: Container(
              width: 260,
              height: 260,
              decoration: BoxDecoration(
                border: Border.all(color: Colors.greenAccent, width: 3),
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: Colors.greenAccent.withOpacity(0.2),
                    blurRadius: 20,
                    spreadRadius: 2,
                  ),
                ],
              ),
            ),
          ),

          // Instruction & Gallery Overlay
          Positioned(
            bottom: 30,
            left: 20,
            right: 20,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Nút chọn ảnh từ thư viện
                ElevatedButton.icon(
                  onPressed: _pickImageFromGallery,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: Colors.black87,
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    elevation: 4,
                  ),
                  icon: const Icon(Icons.photo_library_rounded, color: Colors.purple, size: 20),
                  label: const Text(
                    'Tải ảnh mã QR từ thư viện',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                ),
                const SizedBox(height: 12),

                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.75),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.white24),
                  ),
                  child: Row(
                    children: const [
                      Icon(Icons.qr_code_scanner_rounded, color: Colors.greenAccent, size: 22),
                      SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'Quét camera trực tiếp hoặc chọn ảnh QR đã lưu',
                          style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w500),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          if (_isProcessing)
            Container(
              color: Colors.black.withOpacity(0.6),
              child: const Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    CircularProgressIndicator(color: Colors.greenAccent),
                    SizedBox(height: 16),
                    Text(
                      'Đang kết nối nhận ca cứu hộ...',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
