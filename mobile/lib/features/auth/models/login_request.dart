class LoginRequest {
  final String email;
  final String password;

  LoginRequest({
    required this.email,
    required this.password,
  });

  Map<String, dynamic> toJson() {
    return {
      'email': email,
      'platform': 'MOBILE',
      'provider': 'EMAIL',
      'providerId': null,
      'password': password,
    };
  }
}