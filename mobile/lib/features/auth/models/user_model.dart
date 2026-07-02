import 'package:mobile/features/auth/models/rescuer_model.dart';

class UserModel {
  final String userId;
  final String? phone;
  final String role;
  final bool isVerified;
  final String status;
  final RescuerModel? rescuer;

  UserModel({
    required this.userId,
    this.phone,
    required this.role,
    required this.isVerified,
    required this.status,
    this.rescuer,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      userId: json['userId'] ?? '',
      phone: json['phone'],
      role: json['role'] ?? '',
      isVerified: json['isVerified'] ?? false,
      status: json['status'] ?? '',
      rescuer: json.containsKey('rescuer')
          ? RescuerModel.fromJson(json['rescuer'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'role': role,
      // ... bỏ các thuộc tính khác của bạn vào đây tương tự
    };
  }
}