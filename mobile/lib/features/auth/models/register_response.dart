import 'user_model.dart';

class RegisterResponse {
  final UserModel? user;
  final String? email;
  final String? message;

  RegisterResponse({
    this.user,
    this.email,
    this.message,
  });

  factory RegisterResponse.fromJson(Map<String, dynamic> json) {
    return RegisterResponse(
      user: json['user'] != null ? UserModel.fromJson(json['user']) : null,
      email: json['email']?.toString(),
      message: json['message']?.toString(),
    );
  }
}
