import 'package:mobile/features/victim/data/victim_service.dart';

import '../models/sos_request.dart';

class VictimRepository {
  final VictimService victimService;

  VictimRepository(this.victimService);

  Future<void> sendSos(SosRequest sosRequest) async {
    await victimService.sendSos(sosRequest.toJson());
  }
}
