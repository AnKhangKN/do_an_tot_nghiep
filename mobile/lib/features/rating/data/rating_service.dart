import 'package:dio/dio.dart';

class RatingService {
  final Dio dio;

  RatingService(this.dio);

  /// Gửi đánh giá cho ca cứu hộ đã hoàn thành hoặc bị Cứu hộ viên hủy
  Future<Response> submitRating({
    required String sosRequestId,
    required int rating,
    int? responseSpeed,
    int? attitude,
    int? supportLevel,
    String? comment,
    bool? cancelledUnreasonably,
  }) async {
    return await dio.post(
      '/api/ratings',
      data: {
        'sosRequestId': sosRequestId,
        'rating': rating,
        if (responseSpeed != null) 'responseSpeed': responseSpeed,
        if (attitude != null) 'attitude': attitude,
        if (supportLevel != null) 'supportLevel': supportLevel,
        'comment': comment,
        if (cancelledUnreasonably != null) 'cancelledUnreasonably': cancelledUnreasonably,
      },
    );
  }

  /// Lấy tổng quan điểm đánh giá trung bình của Cứu hộ viên
  Future<Response> getRescuerRatingOverview(String rescuerId) async {
    return await dio.get('/api/ratings/rescuer/$rescuerId/overview');
  }

  /// Lấy danh sách nhận xét của Cứu hộ viên
  Future<Response> getRatingsByRescuerId(String rescuerId, {int page = 1, int limit = 10}) async {
    return await dio.get(
      '/api/ratings/rescuer/$rescuerId',
      queryParameters: {
        'page': page,
        'limit': limit,
      },
    );
  }

  /// Kiểm tra đánh giá của ca SOS
  Future<Response> getRatingBySosId(String sosRequestId) async {
    return await dio.get('/api/ratings/sos/$sosRequestId');
  }
}
