import 'package:flutter/material.dart';
import '../../models/sos_offer_model.dart';

class SOSProvider extends ChangeNotifier {

  SOSOfferModel? _currentSOS;

  SOSOfferModel? get currentSOS => _currentSOS;

  bool get hasSOS => _currentSOS != null;

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

  void clearSOS() {
    _currentSOS = null;
    notifyListeners();
  }
}