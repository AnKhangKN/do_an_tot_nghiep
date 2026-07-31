class SOSOfferModel {
  final String sosId;
  final double victimLat;
  final double victimLng;
  final String? description;
  final String? incidentTypeName;
  final String? imageUrl;

  SOSOfferModel({
    required this.sosId,
    required this.victimLat,
    required this.victimLng,
    this.description,
    this.incidentTypeName,
    this.imageUrl,
  });

  factory SOSOfferModel.fromJson(Map<String, dynamic> json) {
    double parseDouble(dynamic val) {
      if (val == null) return 0.0;
      if (val is num) return val.toDouble();
      return double.tryParse(val.toString()) ?? 0.0;
    }

    return SOSOfferModel(
      sosId: (json["sosId"] ?? json["sos_id"] ?? json["sosRequestId"] ?? json["sos_request_id"] ?? '').toString(),
      victimLat: parseDouble(json["victimLat"] ?? json["victim_lat"] ?? json["lat"]),
      victimLng: parseDouble(json["victimLng"] ?? json["victim_lng"] ?? json["lng"]),
      description: json["description"]?.toString(),
      incidentTypeName: (json["incidentTypeName"] ??
          json["serviceType"] ??
          json["incidentType"] ??
          json["service_type"] ??
          json["incident_type_name"])?.toString(),
      imageUrl: (json["imageUrl"] ??
          json["image_url"] ??
          json["image"] ??
          json["url"] ??
          json["photoUrl"] ??
          json["photo_url"])?.toString(),
    );
  }
}