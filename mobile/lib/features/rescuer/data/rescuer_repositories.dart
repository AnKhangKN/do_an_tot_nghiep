import '../models/rescuer_register_request.dart';
import 'rescuer_services.dart';

class RescuerRepositories {
  final RescuerServices _rescuerServices;

  RescuerRepositories(this._rescuerServices);

  Future<void> registerRescuer(RescuerRegisterRequest request) async {
    await _rescuerServices.registerRescuer(request);
  }
}
