import 'package:flutter/material.dart';
import 'package:mobile/core/constants/color_constants.dart';
import 'package:mobile/core/storage/storage_service.dart';

enum AppThemeMode { system, light, dark }

/// Điều khiển chế độ sáng/tối của ứng dụng.
class ThemeController extends ChangeNotifier with WidgetsBindingObserver {
  ThemeController(this._storageService) {
    WidgetsBinding.instance.addObserver(this);
    _apply();
  }

  final StorageService _storageService;

  AppThemeMode _mode = AppThemeMode.system;
  AppThemeMode get mode => _mode;

  bool get isDark {
    switch (_mode) {
      case AppThemeMode.light:
        return false;
      case AppThemeMode.dark:
        return true;
      case AppThemeMode.system:
        return WidgetsBinding.instance.platformDispatcher.platformBrightness ==
            Brightness.dark;
    }
  }

  ThemeMode get themeMode {
    switch (_mode) {
      case AppThemeMode.light:
        return ThemeMode.light;
      case AppThemeMode.dark:
        return ThemeMode.dark;
      case AppThemeMode.system:
        return ThemeMode.system;
    }
  }

  /// Nạp chế độ đã lưu từ storage (gọi trong bootstrap trước khi runApp).
  Future<void> load() async {
    final saved = await _storageService.getThemeMode();
    if (saved != null) {
      for (final m in AppThemeMode.values) {
        if (m.name == saved) {
          _mode = m;
          break;
        }
      }
    }
    _apply();
  }

  Future<void> setMode(AppThemeMode mode) async {
    if (_mode == mode) return;
    _mode = mode;
    await _storageService.saveThemeMode(mode.name);
    _apply();
  }

  /// Reset về chế độ mặc định (system) khi đăng xuất (app như mới, storage đã bị xóa).
  void reset() {
    if (_mode == AppThemeMode.system) return;
    _mode = AppThemeMode.system;
    _apply();
  }

  void _apply() {
    ColorConstants.applyBrightness(isDark ? Brightness.dark : Brightness.light);
    notifyListeners();
  }

  @override
  void didChangePlatformBrightness() {
    if (_mode == AppThemeMode.system) {
      _apply();
    }
    super.didChangePlatformBrightness();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }
}
