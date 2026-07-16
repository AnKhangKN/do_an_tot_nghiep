class RegisterRequest {
  final String email;
  final String password;
  final String confirmPassword;
  final String provider;
  final String providerId;

  RegisterRequest({
    required this.email,
    required this.password,
    required this.confirmPassword,
    this.provider = 'EMAIL',
    required this.providerId,
  });

  Map<String, dynamic> toJson() {
    return {
      'email': email,
      'password': password,
      'confirmPassword': confirmPassword,
      'provider': provider,
      'providerId': providerId,
    };
  }
}
