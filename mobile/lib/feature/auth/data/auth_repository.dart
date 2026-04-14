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

    await storage.saveToken(
      data['accessToken'],
      data['refreshToken'],
    );
  }
}