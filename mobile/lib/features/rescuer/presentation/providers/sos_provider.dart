import 'package:flutter/material.dart';
import '../../models/sos_offer_model.dart';
import '../../../../core/di/di.dart';
import '../../../../core/session/app_session.dart';
import '../../../../core/background/background_config.dart';

class SOSProvider extends ChangeNotifier {

  SOSOfferModel? _currentSOS;
  SOSOfferModel? _activeRescue;
  Map<String, dynamic>? _activeVictim;

  SOSOfferModel? get currentSOS => _currentSOS;
  SOSOfferModel? get activeRescue => _activeRescue;
  Map<String, dynamic>? get activeVictim => _activeVictim;

  bool get hasSOS => _currentSOS != null;
  bool get isRescuing => _activeRescue != null;

  void receiveSOS(SOSOfferModel sos) {
    debugPrint("Mã bộ nhớ Provider lúc NHẬN SOCKET: $hashCode");

    // Nếu cuốc SOS mới tới có ID trùng với cuốc đang xử lý hiện tại -> BỎ QUA NGAY!
    if (_currentSOS != null && _currentSOS!.sosId == sos.sosId) {
      debugPrint("⚠️ [PROVIDER] Bỏ qua SOS trùng lặp ID: ${sos.sosId}");
      return;
    }

    // 2. Nếu là một cuốc hoàn toàn mới thì mới tiếp tục xử lý
    debugPrint("✅ Đã nhận cuốc SOS mới về provider: ${sos.toString()}");

    _currentSOS = sos;
    notifyListeners();

    // TODO: Kích hoạt âm thanh cảnh báo và hiển thị UI ở đây
  }

  void startRescue(SOSOfferModel sos, Map<String, dynamic> victim) {
    _activeRescue = sos;
    _activeVictim = victim;
    _currentSOS = null; // Tắt offer
    notifyListeners();

    // Tăng tần suất cập nhật GPS khi đang làm nhiệm vụ để marker chuyển động liên tục (1m/lần)
    getIt<AppSession>().updateDistanceFilter(1);
  }

  bool _showSuccessRescueAlert = false;
  bool get showSuccessRescueAlert => _showSuccessRescueAlert;

  void triggerSuccessAlert() {
    _showSuccessRescueAlert = true;
    notifyListeners();
    // Tự động tắt sau 10 giây
    Future.delayed(const Duration(seconds: 10), () {
      _showSuccessRescueAlert = false;
      notifyListeners();
    });
  }

  void dismissSuccessAlert() {
    _showSuccessRescueAlert = false;
    notifyListeners();
  }

  void endRescue() {
    _activeRescue = null;
    _activeVictim = null;
    notifyListeners();

    // Đưa tần suất cập nhật GPS về bình thường để tiết kiệm pin (10m/lần)
    getIt<AppSession>().updateDistanceFilter(BackgroundConfig.minDistanceMeters.toInt());
  }

  void clearSOS() {
    _currentSOS = null;
    notifyListeners();
  }

  String? _cancelledNotice;
  String? get cancelledNotice => _cancelledNotice;

  void handleSosCancelled(String? cancelledSosId, {String? message}) {
    final msg = message ?? "Người gặp nạn đã dừng yêu cầu cứu hộ.";
    debugPrint("🚨 [SOSProvider] Xử lý SOS bị hủy bởi Victim: $cancelledSosId, currentSOSId: ${_currentSOS?.sosId}");
    bool shouldNotify = false;

    if (_currentSOS != null) {
      if (cancelledSosId == null || cancelledSosId.isEmpty || _currentSOS!.sosId == cancelledSosId) {
        _currentSOS = null;
        _cancelledNotice = msg;
        shouldNotify = true;
      }
    }

    if (_activeRescue != null) {
      if (cancelledSosId == null || cancelledSosId.isEmpty || _activeRescue!.sosId == cancelledSosId) {
        _activeRescue = null;
        _activeVictim = null;
        _cancelledNotice = msg;
        shouldNotify = true;
        getIt<AppSession>().updateDistanceFilter(BackgroundConfig.minDistanceMeters.toInt());
      }
    }

    if (shouldNotify) {
      notifyListeners();
    }
  }

  void clearCancelledNotice() {
    _cancelledNotice = null;
    notifyListeners();
  }
}