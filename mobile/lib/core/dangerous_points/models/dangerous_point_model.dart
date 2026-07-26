class DangerousPointModel {
  final String dangerousPointId;
  final String zoneName;
  final String? address;
  final String? description;
  final double latitude;
  final double longitude;
  final String dangerLevel;
  final String status;
  final String? reportedBy;
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
    this.reportedBy,
    this.approvedBy,
    required this.createdAt,
    required this.updatedAt,
  });

  factory DangerousPointModel.fromJson(Map<String, dynamic> json) {
    return DangerousPointModel(
      dangerousPointId: json['dangerousPointId']?.toString() ?? '',
      zoneName: json['zoneName']?.toString() ?? '',
      address: json['address']?.toString(),
      description: json['description']?.toString(),
      latitude: (json['latitude'] as num?)?.toDouble() ?? 0.0,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 0.0,
      dangerLevel: json['dangerLevel']?.toString() ?? 'LOW',
      status: json['status']?.toString() ?? 'PENDING',
      reportedBy: json['reportedBy']?.toString(),
      approvedBy: json['approvedBy']?.toString(),
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
      updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt']) : DateTime.now(),
    );
  }
}
