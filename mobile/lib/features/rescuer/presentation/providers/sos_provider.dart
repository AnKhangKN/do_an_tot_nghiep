import 'package:flutter/material.dart';
import '../../models/sos_offer_model.dart';

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
  }

  void clearSOS() {
    _currentSOS = null;
    notifyListeners();
  }
}