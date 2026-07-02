import 'package:flutter/material.dart';

import '../../../../core/session/app_session.dart';

class SplashProvider extends ChangeNotifier {
  final AppSession appSession;

  SplashProvider(this.appSession);

  bool _isLoading = true;
  bool get isLoading => _isLoading;

  String? _errorMessage;
  String? get error => _errorMessage;

  Future<void> initApp() async {
    try {
      _isLoading = true;
      _errorMessage = null;
      notifyListeners();

      await appSession.init();

    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}