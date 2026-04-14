import 'package:flutter/material.dart';
import 'package:mobile/feature/user/user_repository.dart';
import '../user_model.dart';

class UserProvider extends ChangeNotifier {
  final UserRepository _repo;

  UserProvider(this._repo);

  UserModel? _user;
  UserModel? get user => _user;

  bool _loading = false;
  bool get loading => _loading;

  Future<void> getProfile() async {
    _loading = true;
    notifyListeners();

    try {
      final result = await _repo.getProfile();
      _user = result;
    } catch (e) {
      debugPrint("ERROR: $e");
    }

    _loading = false;
    notifyListeners();
  }
}