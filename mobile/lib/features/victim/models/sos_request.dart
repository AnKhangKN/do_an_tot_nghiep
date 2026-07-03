class SosRequest {
  final String phone;
  final String incidentTypeId;
  final String? description;
  final double victimLat;
  final double victimLng;

  SosRequest({
    required this.phone,
    required this.incidentTypeId,
    this.description,
    required this.victimLat,
    required this.victimLng,
  });

  Map<String, dynamic> toJson() {
    return {
      'phone': phone,
      'incidentTypeId': incidentTypeId,
      'description': description,
      'victimLat': victimLat,
      'victimLng': victimLng
    };
  }
}
