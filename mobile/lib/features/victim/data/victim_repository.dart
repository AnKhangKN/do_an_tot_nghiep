import 'package:mobile/features/victim/data/victim_service.dart';

import '../models/sos_request.dart';

class VictimRepository {
  final VictimService victimService;

  VictimRepository(this.victimService);

  Future<dynamic> sendSos(SosRequest sosRequest) async {
    final res = await victimService.sendSos(sosRequest.toJson());
    return res.data;
  }

  Future<void> cancelSos({String? sosRequestId, String? cancelReason}) async {
    await victimService.cancelSos(sosRequestId: sosRequestId, cancelReason: cancelReason);
  }
}
