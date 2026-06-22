import 'package:mobile/core/incident_types/model/incident_type_model.dart';

import '../services/incident_type_service.dart';

class IncidentTypeRepository {
  final IncidentTypeService incidentTypeService;

  IncidentTypeRepository(this.incidentTypeService);

  Future<List<IncidentTypeModel>> getIncidentType() async {
    final res = await incidentTypeService.getIncidentTypes();

    final List data = res.data['data'];

    return data
        .map((e) => IncidentTypeModel.fromJson(e))
        .toList();
  }
}