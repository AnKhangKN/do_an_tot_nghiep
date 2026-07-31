import 'package:mobile/features/victim/data/victim_service.dart';

import '../models/sos_request.dart';

class VictimRepository {
  final VictimService victimService;

  VictimRepository(this.victimService);

  Future<dynamic> sendSos(SosRequest sosRequest) async {
    final res = await victimService.sendSos(
      sosRequest.toJson(),
      imagePath: sosRequest.imagePath,
    );
    return res.data;
  }


  Future<void> cancelSos({String? sosRequestId, String? cancelReason}) async {
    await victimService.cancelSos(sosRequestId: sosRequestId, cancelReason: cancelReason);
  }

  Future<dynamic> submitPostRescueCheckin({
    required String sosRequestId,
    required String healthStatus,
    String? checkinNotes,
    int? rating,
    int? responseSpeed,
    int? attitude,
    int? supportLevel,
    String? comment,
  }) async {
    final res = await victimService.submitPostRescueCheckin(
      sosRequestId: sosRequestId,
      healthStatus: healthStatus,
      checkinNotes: checkinNotes,
      rating: rating,
      responseSpeed: responseSpeed,
      attitude: attitude,
      supportLevel: supportLevel,
      comment: comment,
    );
    return res.data;
  }
}
