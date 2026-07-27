import 'package:flutter/material.dart';

class MapLayerProvider extends ChangeNotifier {
  // Mặc định: Hiển thị icon cảnh báo nguy hiểm (true), Tắt icon tiện ích (false)
  bool _showDangerousPoints = true;
  bool _showAmenities = false;

  bool get showDangerousPoints => _showDangerousPoints;
  bool get showAmenities => _showAmenities;

  void toggleDangerousPoints(bool value) {
    if (_showDangerousPoints != value) {
      _showDangerousPoints = value;
      notifyListeners();
    }
  }

  void toggleAmenities(bool value) {
    if (_showAmenities != value) {
      _showAmenities = value;
      notifyListeners();
    }
  }
}
