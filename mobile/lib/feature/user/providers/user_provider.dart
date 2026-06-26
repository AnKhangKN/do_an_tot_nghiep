import 'package:flutter/material.dart';
import 'package:mobile/feature/user/repositories/user_repository.dart';
import '../models/user_model.dart';

class UserProvider extends ChangeNotifier {
  final UserRepository _repo;

  UserProvider(this._repo);

  UserModel? _user;
  UserModel? get user => _user;

  bool _loading = false;
  bool get loading => _loading;

  Future<bool> getProfile() async {
    _loading = true;
    notifyListeners();

    try {
      _user = await _repo.getProfile();

      return true;
    } catch (e) {
      debugPrint("ERROR: $e");
      return false;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  void clear() {
    _user = null;
    notifyListeners();
  }
}
