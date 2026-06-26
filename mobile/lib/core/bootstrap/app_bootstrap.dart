import '../../feature/auth/models/user_model.dart';
import '../../feature/auth/repositories/auth_repository.dart';

class AppBootstrap {
  final AuthRepository authRepository;

  AppBootstrap(this.authRepository);

  Future<UserModel?> initialize() async {
    return await authRepository.getMe();
  }
}