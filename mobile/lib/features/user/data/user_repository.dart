import 'package:mobile/features/user/data/user_service.dart';
import '../models/user_model.dart';

class UserRepository {
  final UserService userService;

  UserRepository(this.userService);

  Future<UserModel> getProfile() async {
    final res = await userService.getProfile();

    return UserModel.fromJson(res.data['data']);
  }

  Future<UserModel> uploadAvatar(String imagePath) async {
    final res = await userService.uploadAvatar(imagePath);

    return UserModel.fromJson(res.data['data']);
  }

  Future<UserModel> updateProfile({required String fullName, String? phone}) async {
    final res = await userService.updateProfile(fullName: fullName, phone: phone);

    return UserModel.fromJson(res.data['data']);
  }
}