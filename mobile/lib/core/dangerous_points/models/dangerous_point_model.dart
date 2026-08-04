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
  final String? imageUrl;
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
    this.imageUrl,
    required this.createdAt,
    required this.updatedAt,
  });

  factory DangerousPointModel.fromJson(Map<String, dynamic> json) {
    return DangerousPointModel(
      dangerousPointId: json['dangerousPointId']?.toString() ?? json['dangerous_point_id']?.toString() ?? '',
      zoneName: json['zoneName']?.toString() ?? json['zone_name']?.toString() ?? '',
      address: json['address']?.toString(),
      description: json['description']?.toString(),
      latitude: (json['latitude'] as num?)?.toDouble() ?? 0.0,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 0.0,
      dangerLevel: json['dangerLevel']?.toString() ?? json['danger_level']?.toString() ?? 'LOW',
      status: json['status']?.toString() ?? 'PENDING',
      reportedBy: json['reportedBy']?.toString() ?? json['reported_by']?.toString(),
      approvedBy: json['approvedBy']?.toString() ?? json['approved_by']?.toString(),
      imageUrl: json['imageUrl']?.toString() ?? json['image_url']?.toString(),
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : json['created_at'] != null
              ? DateTime.parse(json['created_at'])
              : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'])
          : json['updated_at'] != null
              ? DateTime.parse(json['updated_at'])
              : DateTime.now(),
    );
  }
}
