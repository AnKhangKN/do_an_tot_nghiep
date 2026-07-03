import 'package:flutter/material.dart';
import 'package:mobile/core/incident_types/data/incident_type_repository.dart';
import '../../../../core/incident_types/models/incident_type_model.dart';
import '../../data/rescuer_repositories.dart';
import '../../models/rescuer_register_request.dart';

class RescuerRegisterProvider extends ChangeNotifier {
  final RescuerRepositories _repo;
  final IncidentTypeRepository _incidentTypeRepository;

  RescuerRegisterProvider(
      this._repo,
      this._incidentTypeRepository,
      );

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
      _incidentTypes =
      await _incidentTypeRepository.getIncidentType();
    } finally {
      _loadingIncidentTypes = false;
      notifyListeners();
    }
  }

  Future<void> registerRescuer({
    required String phone,
    required String gender,
    required String area,
    required String incidentTypeId,
  }) async {
    _loading = true;
    notifyListeners();

    try {
      final request = RescuerRegisterRequest(
        phone: phone,
        gender: gender,
        area: area,
        incidentTypeId: incidentTypeId,
      );

      await _repo.registerRescuer(request);
    } finally {
      _loading = false;
      notifyListeners();
    }
  }
}