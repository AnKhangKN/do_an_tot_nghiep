class RescuerModel {
  final bool isVerified;

  RescuerModel({
    required this.isVerified,
  });

  factory RescuerModel.fromJson(Map<String, dynamic> json) {
    return RescuerModel(
      isVerified: json['isVerified'] ?? false,
    );
  }
}