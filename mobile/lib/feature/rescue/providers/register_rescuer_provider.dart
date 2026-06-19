import 'package:flutter/material.dart';

import '../models/register_rescuer_request.dart';
import '../repositories/rescuer_repositories.dart';

class RegisterRescuerProvider extends ChangeNotifier {
  final RescuerRepositories _repo;

  RegisterRescuerProvider(this._repo);

  // Step 1
  String fullName = '';
  String email = '';
  String phone = '';
  String gender = '';

  // Step 2
  String area = '';
  String incidentTypesId = '';

  bool _loading = false;
  bool get loading => _loading;

  void saveStep1({
    required String fullName,
    required String email,
    required String phone,
    required String gender,
  }) {
    this.fullName = fullName;
    this.email = email;
    this.phone = phone;
    this.gender = gender;

    notifyListeners();
  }

  void saveStep2({required String area, required String incidentTypesId}) {
    this.area = area;
    this.incidentTypesId = incidentTypesId;

    notifyListeners();
  }

  Future<void> registerRescuer() async {
    _loading = true;
    notifyListeners();

    try {
      final request = RegisterRescuerRequest(
        fullName: fullName,
        email: email,
        phone: phone,
        gender: gender,
        area: area,
        incidentTypesId: incidentTypesId,
      );

      await _repo.registerRescuer(request);

      clear();
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  void clear() {
    fullName = '';
    email = '';
    phone = '';
    gender = '';
    area = '';
    incidentTypesId = '';
  }
}
