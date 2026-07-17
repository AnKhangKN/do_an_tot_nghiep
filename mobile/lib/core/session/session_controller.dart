import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:get_it/get_it.dart';
import 'package:mobile/core/session/session_state.dart';

import 'app_session.dart';

class SessionController with ChangeNotifier {
  AppSession get session => GetIt.instance<AppSession>();

  SessionController();

  SessionState _state = SessionState.initial();

  SessionState get state => _state;

  bool get isLoggedIn => _state.isLoggedIn;
  bool get isOnline => _state.isOnline;
  UserRole? get role => _state.role;
  Position? get position => _state.position;
  bool get isProcessing => _state.isProcessing;
  bool get isSearchingRescuer => _state.isSearchingRescuer;

  void setProcessing(bool value) {
    _state = _state.copyWith(isProcessing: value);
    notifyListeners();
  }

  void setSearchingRescuer(bool value) {
    _state = _state.copyWith(isSearchingRescuer: value);
    notifyListeners();
  }

  void setLoggedIn(bool value) {
    _state = _state.copyWith(isLoggedIn: value);
    notifyListeners();
  }

  void setRole(UserRole? role) {
    _state = _state.copyWith(role: role);
    notifyListeners();
  }

  void setOnline(bool value) {
    _state = _state.copyWith(isOnline: value);
    notifyListeners();
  }

  void updatePosition(Position position) {
    _state = _state.copyWith(position: position);
    notifyListeners();
  }

  void reset() {
    _state = SessionState.initial();
    notifyListeners();
  }
}