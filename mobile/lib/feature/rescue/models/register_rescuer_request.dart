class RegisterRescuerRequest {
  final String fullName;
  final String email;
  final String phone;
  final String gender;
  final String area;
  final String incidentTypesId;

  RegisterRescuerRequest({
    required this.fullName,
    required this.email,
    required this.phone,
    required this.gender,
    required this.area,
    required this.incidentTypesId,
  });

  Map<String, dynamic> toJson() {
    return {
      'fullName': fullName,
      'email': email,
      'phone': phone,
      'gender': gender,
      'area': area,
      'incidentTypesId': incidentTypesId,
    };
  }
}