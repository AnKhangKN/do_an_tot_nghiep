import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class StorageService {
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  static const String _accessTokenKey = 'access_token';
  static const String _refreshTokenKey = 'refresh_token';

  Future<void> saveToken(String accessToken, String refreshToken) async {
    await _storage.write(key: _accessTokenKey, value: accessToken);
    await _storage.write(key: _refreshTokenKey, value: refreshToken);
  }

  Future<void> saveAccessToken(String accessToken) async {
    await _storage.write(key: _accessTokenKey, value: accessToken);
  }

  Future<String?> getAccessToken() async {
    return _storage.read(key: _accessTokenKey);
  }

  Future<String?> getRefreshToken() async {
    return _storage.read(key: _refreshTokenKey);
  }

  Future<void> clearToken() async {

    await _storage.delete(key: _accessTokenKey);
    await _storage.delete(key: _refreshTokenKey);
  }

  Future<void> clearAll() async {
    await _storage.deleteAll();
  }

  static const String _isBannedKey = 'is_banned';
  static const String _banReasonKey = 'ban_reason';

  Future<void> saveBanState({required bool isBanned, String? reason}) async {
    if (isBanned) {
      await _storage.write(key: _isBannedKey, value: 'true');
      if (reason != null) {
        await _storage.write(key: _banReasonKey, value: reason);
      }
    } else {
      await _storage.delete(key: _isBannedKey);
      await _storage.delete(key: _banReasonKey);
    }
  }

  Future<bool> getIsBanned() async {
    final val = await _storage.read(key: _isBannedKey);
    return val == 'true';
  }

  Future<String?> getBanReason() async {
    return _storage.read(key: _banReasonKey);
  }

  Future<void> clearBanState() async {
    await _storage.delete(key: _isBannedKey);
    await _storage.delete(key: _banReasonKey);
  }

  static const String _savedPhoneKey = 'saved_sos_phone';

  Future<void> saveSavedPhone(String phone) async {
    await _storage.write(key: _savedPhoneKey, value: phone);
  }

  Future<String?> getSavedPhone() async {
    return _storage.read(key: _savedPhoneKey);
  }

  static const String _themeModeKey = 'theme_mode';

  Future<void> saveThemeMode(String mode) async {
    await _storage.write(key: _themeModeKey, value: mode);
  }

  Future<String?> getThemeMode() async {
    return _storage.read(key: _themeModeKey);
  }
}
