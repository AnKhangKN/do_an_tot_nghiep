import '../../../core/services/storage_service.dart';
import 'auth_service.dart';

class AuthRepository {
  final AuthService service;
  final StorageService storage;

  AuthRepository(this.service, this.storage);

  Future<void> login(String email, String password) async {
    final res = await service.login({
      "email": email,
      "platform": "MOBILE",
      "provider": "EMAIL",
      "providerId": null,
      "password": password,
    });

    final data = res.data['data'];

    if (data is! Map<String, dynamic>) {
      throw Exception('Phản hồi đăng nhập không hợp lệ');
    }

    final accessToken = data['accessToken'] as String?;
    final refreshToken = data['refreshToken'] as String?;

    if (accessToken == null ||
        accessToken.isEmpty ||
        refreshToken == null ||
        refreshToken.isEmpty) {
      throw Exception('Thiếu token đăng nhập');
    }

    await storage.saveToken(
      accessToken,
      refreshToken,
    );
  }
}
