import 'package:flutter/material.dart';
import 'package:mobile/core/session/app_session.dart';
import 'package:mobile/core/storage/storage_service.dart';

import '../models/login_request.dart';
import '../repositories/auth_repository.dart';

class AuthProvider extends ChangeNotifier {
  final AuthRepository repo;
  final AppSession appSession;
  final StorageService storageService;

  AuthProvider(this.repo, this.appSession, this.storageService);

  bool isLoading = false;
  String? error;

  Future<bool> login(String email, String password) async {
    try {
      isLoading = true;
      error = null;
      notifyListeners();

      final result = await repo.login(
        LoginRequest(email: email, password: password),
      );

      final accessToken = result.accessToken;
      final refreshToken = result.refreshToken;

      if (accessToken.isNotEmpty && refreshToken.isNotEmpty) {
        await storageService.saveToken(
          accessToken,
          refreshToken,
        );

        await appSession.start();
        return true;
      }

      return false;
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
    await appSession.stop();
    notifyListeners();
  }
}
