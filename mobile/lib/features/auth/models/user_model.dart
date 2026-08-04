import 'package:mobile/features/auth/models/rescuer_model.dart';

class UserModel {
  final String userId;
  final String? email;
  final String? phone;
  final String role;
  final bool isVerified;
  final String status;
  final String? banReason;
  final String? bannedAt;
  final RescuerModel? rescuer;

  UserModel({
    required this.userId,
    this.email,
    this.phone,
    required this.role,
    required this.isVerified,
    required this.status,
    this.banReason,
    this.bannedAt,
    this.rescuer,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      userId: json['userId'] ?? json['user_id'] ?? '',
      email: json['email'],
      phone: json['phone'],
      role: json['role'] ?? '',
      isVerified: json['isVerified'] ?? json['is_verified'] ?? false,
      status: json['status'] ?? '',
      banReason: json['banReason'] ?? json['ban_reason'],
      bannedAt: json['bannedAt'] ?? json['banned_at'],
      rescuer: json.containsKey('rescuer') && json['rescuer'] != null
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