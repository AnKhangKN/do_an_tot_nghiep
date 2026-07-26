import '../models/rescuer_register_request.dart';
import 'rescuer_service.dart';

class RescuerRepository {
  final RescuerService _rescuerService;

  RescuerRepository(this._rescuerService);

  Future<void> registerRescuer(RescuerRegisterRequest request) async {
    await _rescuerService.registerRescuer(request);
  }

  Future<dynamic> acceptSosByQr(String sosRequestId) async {
    return await _rescuerService.acceptSosByQr(sosRequestId);
  }
}
