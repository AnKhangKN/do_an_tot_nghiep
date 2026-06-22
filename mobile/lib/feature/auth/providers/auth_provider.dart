import 'package:flutter/material.dart';

import '../models/login_request.dart';
import '../repositories/auth_repository.dart';

class AuthProvider extends ChangeNotifier {
  final AuthRepository repo;

  AuthProvider(this.repo);

  bool isLoading = false;
  String? error;

  Future<bool> login(String email, String password) async {
    try {
      isLoading = true;
      error = null;
      notifyListeners();

      await repo.login(LoginRequest(email: email, password: password));

      return true;
    } catch (e) {
      error = e.toString();
      return false;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await repo.logout();
    notifyListeners();
  }

}
