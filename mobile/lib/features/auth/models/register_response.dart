import 'user_model.dart';

class RegisterResponse {
  final UserModel user;

  RegisterResponse({required this.user});

  factory RegisterResponse.fromJson(Map<String, dynamic> json) {
    return RegisterResponse(
      user: UserModel.fromJson(json['user']),
    );
  }
}
