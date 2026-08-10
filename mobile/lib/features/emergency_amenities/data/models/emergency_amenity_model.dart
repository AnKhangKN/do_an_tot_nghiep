class EmergencyAmenityModel {
  final String amenityId;
  final String amenityCategoryId;
  final String? categoryName;
  final String? iconName;
  final String? phone;
  final double latitude;
  final double longitude;
  final String openingHours;
  final String status;
  final String? reporterName;
  final String? imageUrl;

  bool get isEligibleToShow => status.toUpperCase() == 'APPROVED';

  EmergencyAmenityModel({
    required this.amenityId,
    required this.amenityCategoryId,
    this.categoryName,
    this.iconName,
    this.phone,
    required this.latitude,
    required this.longitude,
    required this.openingHours,
    required this.status,
    this.reporterName,
    this.imageUrl,
  });

  factory EmergencyAmenityModel.fromJson(Map<String, dynamic> json) {
    return EmergencyAmenityModel(
      amenityId: json['amenityId'] ?? json['amenity_id'] ?? '',
      amenityCategoryId: json['amenityCategoryId'] ?? json['amenity_category_id'] ?? '',
      categoryName: json['categoryName'] ?? json['category_name'],
      iconName: json['iconName'] ?? json['icon_name'],
      phone: json['phone'],
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      openingHours: json['openingHours'] ?? json['opening_hours'] ?? '07:00 - 21:00',
      status: json['status'] ?? 'APPROVED',
      reporterName: json['reporterName'] ?? json['reporter_name'],
      imageUrl: json['imageUrl'] ?? json['image_url'],
    );
  }


  Map<String, dynamic> toJson() {
    return {
      'amenityId': amenityId,
      'amenityCategoryId': amenityCategoryId,
      'phone': phone,
      'latitude': latitude,
      'longitude': longitude,
      'openingHours': openingHours,
      'status': status,
    };
  }
}
