/// Request đánh giá đa khía cạnh chất lượng cứu hộ
class RatingRequest {
  final String sosRequestId;
  final int rating;
  final int? responseSpeed;
  final int? attitude;
  final int? supportLevel;
  final String? comment;
  final bool? cancelledUnreasonably;

  const RatingRequest({
    required this.sosRequestId,
    required this.rating,
    this.responseSpeed,
    this.attitude,
    this.supportLevel,
    this.comment,
    this.cancelledUnreasonably,
  });

  Map<String, dynamic> toJson() => {
    'sosRequestId': sosRequestId,
    'rating': rating,
    if (responseSpeed != null) 'responseSpeed': responseSpeed,
    if (attitude != null) 'attitude': attitude,
    if (supportLevel != null) 'supportLevel': supportLevel,
    if (comment != null && comment!.isNotEmpty) 'comment': comment,
    if (cancelledUnreasonably != null) 'cancelledUnreasonably': cancelledUnreasonably,
  };
}

/// Response đánh giá từ server (hỗ trợ cả snake_case và camelCase)
class RatingResponse {
  final String? ratingId;
  final String? sosRequestId;
  final String? victimId;
  final String? rescuerId;
  final int? rating;
  final int? responseSpeed;
  final int? attitude;
  final int? supportLevel;
  final String? sentiment;
  final double? sentimentConfidence;
  final bool? isFlagged;
  final bool? cancelledUnreasonably;
  final String? comment;
  final String? victimName;
  final String? victimAvatar;
  final String? createdAt;

  const RatingResponse({
    this.ratingId,
    this.sosRequestId,
    this.victimId,
    this.rescuerId,
    this.rating,
    this.responseSpeed,
    this.attitude,
    this.supportLevel,
    this.sentiment,
    this.sentimentConfidence,
    this.isFlagged,
    this.cancelledUnreasonably,
    this.comment,
    this.victimName,
    this.victimAvatar,
    this.createdAt,
  });

  factory RatingResponse.fromJson(Map<String, dynamic> json) {
    T? value<T>(String snake, String camel) {
      final raw = json[snake] ?? json[camel];
      if (raw == null) return null;
      return raw as T;
    }

    return RatingResponse(
      ratingId: value<String>('rating_id', 'ratingId'),
      sosRequestId: value<String>('sos_request_id', 'sosRequestId'),
      victimId: value<String>('victim_id', 'victimId'),
      rescuerId: value<String>('rescuer_id', 'rescuerId'),
      rating: value<int>('rating', 'rating'),
      responseSpeed: value<int>('response_speed', 'responseSpeed'),
      attitude: value<int>('attitude', 'attitude'),
      supportLevel: value<int>('support_level', 'supportLevel'),
      sentiment: value<String>('sentiment', 'sentiment'),
      sentimentConfidence: double.tryParse('${json['sentiment_confidence'] ?? json['sentimentConfidence'] ?? ''}'),
      isFlagged: json['is_flagged'] ?? json['isFlagged'],
      cancelledUnreasonably: json['cancelled_unreasonably'] ?? json['cancelledUnreasonably'],
      comment: value<String>('comment', 'comment'),
      victimName: value<String>('victim_name', 'victimName'),
      victimAvatar: value<String>('victim_avatar', 'victimAvatar'),
      createdAt: value<String>('created_at', 'createdAt'),
    );
  }
}
