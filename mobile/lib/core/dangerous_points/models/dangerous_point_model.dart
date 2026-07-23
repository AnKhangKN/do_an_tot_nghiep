class DangerousPointModel {
  final String dangerousPointId;
  final String zoneName;
  final String? address;
  final String? description;
  final double latitude;
  final double longitude;
  final String dangerLevel;
  final String status;
  final String reportedBy;
  final String? approvedBy;
  final DateTime createdAt;
  final DateTime updatedAt;

  DangerousPointModel({
    required this.dangerousPointId,
    required this.zoneName,
    this.address,
    this.description,
    required this.latitude,
    required this.longitude,
    required this.dangerLevel,
    required this.status,
    required this.reportedBy,
    this.approvedBy,
    required this.createdAt,
    required this.updatedAt,
  });

  factory DangerousPointModel.fromJson(Map<String, dynamic> json) {
    return DangerousPointModel(
      dangerousPointId: json['dangerousPointId'],
      zoneName: json['zoneName'],
      address: json['address'],
      description: json['description'],
      latitude: json['latitude'] is int 
          ? (json['latitude'] as int).toDouble() 
          : json['latitude'] as double,
      longitude: json['longitude'] is int 
          ? (json['longitude'] as int).toDouble() 
          : json['longitude'] as double,
      dangerLevel: json['dangerLevel'],
      status: json['status'],
      reportedBy: json['reportedBy'],
      approvedBy: json['approvedBy'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }
}
