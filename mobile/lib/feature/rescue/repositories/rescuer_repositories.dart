
import '../models/register_rescuer_request.dart';
import '../services/rescuer_services.dart';

class RescuerRepositories {
  final RescuerServices _rescuerServices;

  RescuerRepositories(this._rescuerServices);

  Future<void> registerRescuer(
      RegisterRescuerRequest request,
      ) async {
    await _rescuerServices.registerRescuer(
      request,
    );
  }
}