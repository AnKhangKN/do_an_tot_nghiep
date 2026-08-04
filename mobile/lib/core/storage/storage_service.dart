import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:uuid/uuid.dart';

class StorageService {
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  final Uuid _uuid = const Uuid();

  static const String _accessTokenKey = 'access_token';
  static const String _refreshTokenKey = 'refresh_token';

  static const String _deviceIdKey = 'device_id';

  /// Lấy deviceId cố định của thiết bị. Tạo mới (UUID) và lưu lại nếu chưa có.
  /// Dùng để nhận diện thiết bị khi xử lý "single active session" ở server.
  Future<String> getOrCreateDeviceId() async {
    final existing = await _storage.read(key: _deviceIdKey);
    if (existing != null && existing.isNotEmpty) {
      return existing;
    }
    final deviceId = _uuid.v4();
    await _storage.write(key: _deviceIdKey, value: deviceId);
    return deviceId;
  }

  Future<void> saveDeviceId(String deviceId) async {
    await _storage.write(key: _deviceIdKey, value: deviceId);
  }

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

  // Cấu hình cài đặt thông báo & báo động
  static const String _notifyHazardKey = 'settings_notify_hazard';

  Future<void> saveSettingsConfig({required bool notifyHazard}) async {
    await _storage.write(key: _notifyHazardKey, value: notifyHazard.toString());
  }

  Future<Map<String, bool>> getSettingsConfig() async {
    final notifyHazard = await _storage.read(key: _notifyHazardKey);

    return {
      'notifyHazard': notifyHazard == null ? true : notifyHazard == 'true',
    };
  }

  // Quản lý giới hạn 2 lượt gửi SOS/ngày cho tài khoản khách (Guest)
  static const String _guestSosDateKey = 'guest_sos_date';
  static const String _guestSosCountKey = 'guest_sos_count';

  /// Kiểm tra số lần gửi SOS trong ngày của Guest.
  /// Nếu ngày lưu khác hôm nay thì tự động reset về 0.
  Future<int> getGuestSosCountToday() async {
    final nowStr = DateTime.now().toIso8601String().split('T')[0];
    final lastDate = await _storage.read(key: _guestSosDateKey);

    if (lastDate != nowStr) {
      await _storage.write(key: _guestSosDateKey, value: nowStr);
      await _storage.write(key: _guestSosCountKey, value: '0');
      return 0;
    }

    final countStr = await _storage.read(key: _guestSosCountKey);
    return int.tryParse(countStr ?? '0') ?? 0;
  }

  /// Tăng số lần gửi SOS trong ngày của Guest lên +1.
  Future<void> incrementGuestSosCount() async {
    final nowStr = DateTime.now().toIso8601String().split('T')[0];
    final currentCount = await getGuestSosCountToday();
    final newCount = currentCount + 1;
    await _storage.write(key: _guestSosDateKey, value: nowStr);
    await _storage.write(key: _guestSosCountKey, value: newCount.toString());
  }

  // Quản lý cố định 1 số điện thoại cho tài khoản Guest trên chiếc máy này
  static const String _guestPhoneKey = 'guest_saved_phone';

  Future<void> saveGuestPhone(String phone) async {
    await _storage.write(key: _guestPhoneKey, value: phone);
  }

  Future<String?> getGuestPhone() async {
    return _storage.read(key: _guestPhoneKey);
  }

  /// Khôi phục số lượt SOS Guest trong ngày (dùng khi dọn dẹp storage sau logout)
  Future<void> restoreGuestSosCount(int count) async {
    final nowStr = DateTime.now().toIso8601String().split('T')[0];
    await _storage.write(key: _guestSosDateKey, value: nowStr);
    await _storage.write(key: _guestSosCountKey, value: count.toString());
  }
}
