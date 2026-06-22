class IncidentTypeModel {
  final String incidentTypeId;
  final String incidentType;

  IncidentTypeModel({required this.incidentTypeId, required this.incidentType});

  factory IncidentTypeModel.fromJson(Map<String, dynamic> json) {
    return IncidentTypeModel(
      incidentTypeId: json['incidentTypeId'],
      incidentType: json['incidentType'],
    );
  }
}
