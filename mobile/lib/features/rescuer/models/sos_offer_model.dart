class SOSOfferModel {
  final String sosId;
  final double victimLat;
  final double victimLng;
  final String? description;

  SOSOfferModel({
    required this.sosId,
    required this.victimLat,
    required this.victimLng,
    this.description,
  });

  factory SOSOfferModel.fromJson(
      Map<String, dynamic> json,
      ) {
    return SOSOfferModel(
      sosId: json["sosId"],
      victimLat: (json["victimLat"] as num).toDouble(),
      victimLng: (json["victimLng"] as num).toDouble(),
      description: json["description"],
    );
  }
}