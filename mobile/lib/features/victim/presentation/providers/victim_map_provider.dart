import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:mobile/core/incident_types/data/incident_type_repository.dart';
import '../../../../core/incident_types/models/incident_type_model.dart';
import '../../../../core/di/di.dart';
import '../../../../core/session/session_controller.dart';
import '../../data/victim_repository.dart';
import '../../models/sos_request.dart';

class VictimMapProvider extends ChangeNotifier {
  final VictimRepository victimRepository;
  final IncidentTypeRepository incidentTypeRepository;

  VictimMapProvider(this.victimRepository, this.incidentTypeRepository);

  bool _loading = false;
  bool get loading => _loading;

  bool _loadingIncidentTypes = false;
  bool get loadingIncidentTypes => _loadingIncidentTypes;

  List<IncidentTypeModel> _incidentTypes = [];
  List<IncidentTypeModel> get incidentTypes => _incidentTypes;

  Future<void> loadIncidentTypes() async {
    _loadingIncidentTypes = true;
    notifyListeners();

    try {
      _incidentTypes = await incidentTypeRepository.getIncidentType();
    } finally {
      _loadingIncidentTypes = false;
      notifyListeners();
    }
  }

  Future<bool> sendSos(
    String phone,
    String incidentTypeId,
    String? description,
    double victimLat,
    double victimLng,
  ) async {
    _loading = true;
    notifyListeners();

    try {
      final request = SosRequest(
        phone: phone,
        incidentTypeId: incidentTypeId,
        description: description,
        victimLat: victimLat,
        victimLng: victimLng,
      );

      debugPrint(request.toJson().toString());

      await victimRepository.sendSos(request);

      // Cập nhật trạng thái đang tìm cứu hộ viên vào SessionController (state tập trung)
      getIt<SessionController>().setSearchingRescuer(true);

      return true;
    } catch (err) {
      debugPrint(err.toString());
      return false;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }
}
