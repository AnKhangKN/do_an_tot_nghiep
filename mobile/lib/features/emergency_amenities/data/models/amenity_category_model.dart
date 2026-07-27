class AmenityCategoryModel {
  final String amenityCategoryId;
  final String categoryName;
  final String iconName;
  final String status;

  AmenityCategoryModel({
    required this.amenityCategoryId,
    required this.categoryName,
    required this.iconName,
    required this.status,
  });

  factory AmenityCategoryModel.fromJson(Map<String, dynamic> json) {
    return AmenityCategoryModel(
      amenityCategoryId: json['amenityCategoryId'] ?? json['amenity_category_id'] ?? '',
      categoryName: json['categoryName'] ?? json['category_name'] ?? '',
      iconName: json['iconName'] ?? json['icon_name'] ?? 'wrench',
      status: json['status'] ?? 'ACTIVE',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'amenityCategoryId': amenityCategoryId,
      'categoryName': categoryName,
      'iconName': iconName,
      'status': status,
    };
  }
}
