import 'package:flutter/material.dart';
import '../../data/user_repository.dart';
import '../../models/user_model.dart';

class UserProvider extends ChangeNotifier {
  final UserRepository _repo;

  UserProvider(this._repo);

  UserModel? _user;
  UserModel? get user => _user;

  bool _loading = false;
  bool get loading => _loading;

  bool _uploadingAvatar = false;
  bool get uploadingAvatar => _uploadingAvatar;

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

  Future<bool> updateAvatar(String imagePath) async {
    _uploadingAvatar = true;
    notifyListeners();

    try {
      _user = await _repo.uploadAvatar(imagePath);
      return true;
    } catch (e) {
      debugPrint("ERROR UPLOAD AVATAR: $e");
      return false;
    } finally {
      _uploadingAvatar = false;
      notifyListeners();
    }
  }

  void clear() {
    _user = null;
    notifyListeners();
  }
}

