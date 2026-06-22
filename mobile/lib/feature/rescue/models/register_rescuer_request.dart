class RegisterRescuerRequest {
  final String phone;
  final String gender;
  final String area;
  final String incidentTypeId;

  RegisterRescuerRequest({
    required this.phone,
    required this.gender,
    required this.area,
    required this.incidentTypeId,
  });

  Map<String, dynamic> toJson() {
    return {
      'phone': phone,
      'gender': gender,
      'area': area,
      'incidentTypeId': incidentTypeId,
    };
  }
}