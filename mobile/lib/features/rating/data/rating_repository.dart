import 'rating_service.dart';

class RatingRepository {
  final RatingService ratingService;

  RatingRepository(this.ratingService);

  Future<dynamic> submitRating({
    required String sosRequestId,
    required int rating,
    String? comment,
  }) async {
    final response = await ratingService.submitRating(
      sosRequestId: sosRequestId,
      rating: rating,
      comment: comment,
    );
    return response.data;
  }

  Future<Map<String, dynamic>> getRescuerRatingOverview(String rescuerId) async {
    final response = await ratingService.getRescuerRatingOverview(rescuerId);
    return Map<String, dynamic>.from(response.data['data'] ?? {});
  }

  Future<dynamic> getRatingsByRescuerId(String rescuerId, {int page = 1, int limit = 10}) async {
    final response = await ratingService.getRatingsByRescuerId(rescuerId, page: page, limit: limit);
    return response.data['data'];
  }

  Future<dynamic> getRatingBySosId(String sosRequestId) async {
    final response = await ratingService.getRatingBySosId(sosRequestId);
    return response.data['data'];
  }
}
