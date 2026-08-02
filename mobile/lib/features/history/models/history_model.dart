class HistoryModel {
  final String id; // sos_request_id hoặc rescuer_history_id
  final String sosRequestId;
  final String description;
  final double victimLat;
  final double victimLng;
  final String status; // Trạng thái hiển thị: DONE, CANCELLED, REJECTED, TIMEOUT, ACCEPTED, PENDING
  final DateTime date;
  final String incidentType;
  
  // Thông tin đối phương
  final String? partnerName;
  final String? partnerPhone;
  final String? partnerAvatarUrl;
  
  // Chi tiết thêm
  final String? cancelReason;
  final String? cancelledBy; // 'VICTIM' | 'RESCUER' | 'SYSTEM'
  final String? action; // Dành riêng cho Rescuer

  HistoryModel({
    required this.id,
    required this.sosRequestId,
    required this.description,
    required this.victimLat,
    required this.victimLng,
    required this.status,
    required this.date,
    required this.incidentType,
    this.partnerName,
    this.partnerPhone,
    this.partnerAvatarUrl,
    this.cancelReason,
    this.cancelledBy,
    this.action,
  });

  factory HistoryModel.fromJson(Map<String, dynamic> json, String role) {
    if (role == 'RESCUER') {
      return HistoryModel(
        id: json['rescuer_history_id'] ?? '',
        sosRequestId: json['sos_request_id'] ?? '',
        description: json['description'] ?? '',
        victimLat: (json['victim_lat'] as num?)?.toDouble() ?? 0.0,
        victimLng: (json['victim_lng'] as num?)?.toDouble() ?? 0.0,
        status: json['action'] ?? '', // Rescuer hiển thị trạng thái theo hành động tương tác của họ
        date: json['interaction_at'] != null 
            ? DateTime.parse(json['interaction_at'])
            : DateTime.now(),
        incidentType: json['incident_type'] ?? 'Cứu hộ khẩn cấp',
        partnerName: json['victim_name'],
        partnerPhone: json['victim_phone'],
        partnerAvatarUrl: json['victim_avatar_url'],
        cancelReason: json['cancel_reason'],
        action: json['action'],
      );
    } else {
      return HistoryModel(
        id: json['sos_request_id'] ?? '',
        sosRequestId: json['sos_request_id'] ?? '',
        description: json['description'] ?? '',
        victimLat: (json['victim_lat'] as num?)?.toDouble() ?? 0.0,
        victimLng: (json['victim_lng'] as num?)?.toDouble() ?? 0.0,
        status: json['status'] ?? '', // Victim hiển thị trạng thái của ca SOS
        date: json['created_at'] != null 
            ? DateTime.parse(json['created_at'])
            : DateTime.now(),
        incidentType: json['incident_type'] ?? 'Cứu hộ khẩn cấp',
        partnerName: json['rescuer_name'],
        partnerPhone: json['rescuer_phone'],
        partnerAvatarUrl: json['rescuer_avatar_url'],
        cancelReason: json['cancel_reason'],
        cancelledBy: json['cancelled_by'],
        action: null,
      );
    }
  }
}
