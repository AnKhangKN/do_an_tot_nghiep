import 'package:mobile/feature/user/user_model.dart';
import 'package:mobile/feature/user/user_service.dart';

class UserRepository {
  final UserService userService;

  UserRepository(this.userService);

  Future<UserModel> getProfile() async {
    final res = await userService.getProfile();
    print("Nhận thông tin");
    print("res.data.data: ${res.data['data']}");

    return UserModel.fromJson(res.data['data']);
  }
}