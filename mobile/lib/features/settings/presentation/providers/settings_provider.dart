import 'package:flutter/material.dart';
import '../../../../core/storage/storage_service.dart';

class SettingsProvider with ChangeNotifier {
  final StorageService _storageService;

  SettingsProvider(this._storageService) {
    loadSettings();
  }

  bool _notifyHazard = true;
  bool _isLoaded = false;

  bool get notifyHazard => _notifyHazard;
  bool get isLoaded => _isLoaded;

  Future<void> loadSettings() async {
    try {
      final config = await _storageService.getSettingsConfig();
      _notifyHazard = config['notifyHazard'] ?? true;
    } catch (e) {
      debugPrint('Error loading settings config: $e');
    } finally {
      _isLoaded = true;
      notifyListeners();
    }
  }

  Future<void> updateNotifyHazard(bool val) async {
    _notifyHazard = val;
    notifyListeners();
    await _storageService.saveSettingsConfig(notifyHazard: _notifyHazard);
  }
}
