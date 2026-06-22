import '../../../core/storage/storage_service.dart';
import '../models/auth_model.dart';
import '../models/login_request.dart';
import '../services/auth_service.dart';

class AuthRepository {
  final AuthService service;
  final StorageService storage;

  AuthRepository(this.service, this.storage);

  Future<AuthModel> login(LoginRequest request) async {
    final res = await service.login(request.toJson());

    final data = res.data['data'];

    if (data is! Map<String, dynamic>) {
      throw Exception('Phản hồi đăng nhập không hợp lệ');
    }

    final auth = AuthModel.fromJson(data);

    await storage.saveToken(auth.accessToken, auth.refreshToken);

    return auth;
  }

  Future<void> logout() async {
    await storage.clearToken();
  }
}
