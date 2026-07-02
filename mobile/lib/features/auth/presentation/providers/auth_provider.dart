import 'package:flutter/material.dart';
import 'package:mobile/core/session/app_session.dart';
import 'package:mobile/core/storage/storage_service.dart';

import '../../../../core/session/session_state.dart';
import '../../data/auth_repository.dart';
import '../../models/login_request.dart';

class AuthProvider extends ChangeNotifier {
  final AuthRepository authRepository;
  final AppSession appSession;
  final StorageService storageService;

  AuthProvider(this.authRepository, this.appSession, this.storageService);

  bool isLoading = false;
  String? error;

  Future<bool> login(String email, String password) async {
    try {
      isLoading = true;
      error = null;
      notifyListeners();

      final result = await authRepository.login(
        LoginRequest(email: email, password: password),
      );

      final accessToken = result.accessToken;
      final refreshToken = result.refreshToken;

      if (accessToken.isNotEmpty && refreshToken.isNotEmpty) {
        // 1. Lưu token mới vào máy
        await storageService.saveToken(
          accessToken,
          refreshToken,
        );

        // Cần gọi để setup session
        await appSession.init();

        // 2. Không gọi hàm gán quyền gì ở đây cả, trả về true luôn
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
    await authRepository.logout();
    await appSession.logout();
    notifyListeners();
  }
}
