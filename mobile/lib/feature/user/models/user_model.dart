class UserModel {
  final String userId;
  final String fullName;
  final String email;
  final String? phone;
  final String role;
  final String status;
  final String? avatarUrl;
  final bool isVerified;

  UserModel({
    required this.userId,
    required this.fullName,
    required this.email,
    this.phone,
    required this.role,
    required this.status,
    this.avatarUrl,
    required this.isVerified,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      userId: json['userId'] ?? '',
      fullName: json['fullName'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'], // nullable
      role: json['role'] ?? '',
      status: json['status'] ?? '',
      avatarUrl: json['avatarUrl'], // nullable
      isVerified: json['isVerified'] ?? false,
    );
  }
}