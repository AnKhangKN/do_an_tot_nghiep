import 'package:flutter/cupertino.dart';
import 'package:geolocator/geolocator.dart';
import 'package:get_it/get_it.dart';
import 'app_session.dart';
import 'session_state.dart';

class SessionController with ChangeNotifier {
  AppSession get session => GetIt.instance<AppSession>();

  SessionController();

  SessionState _state = SessionState.initial();

  SessionState get state => _state;

  bool get isLoggedIn => _state.isLoggedIn;
  bool get isOnline => _state.isOnline;
  UserRole? get role => _state.role;


  void setLoggedIn(bool value) {
    _state = _state.copyWith(isLoggedIn: value);
    notifyListeners(); // 🌟 THÊM DÒNG NÀY để GoRouter biết và chạy hàm redirect
  }

  // void setOnline(bool value) {
  //   _state = _state.copyWith(isOnline: value);
  //   notifyListeners(); // 🌟 THÊM DÒNG NÀY
  // }

  void setRole(UserRole? role) {
    _state = _state.copyWith(role: role);
    notifyListeners(); // 🌟 THÊM DÒNG NÀY
  }

  void setPosition(Position position) {
    _state = _state.copyWith(position: position);
    notifyListeners();
  }

  void reset() {
    _state = SessionState.initial();
    notifyListeners(); // 🌟 THÊM DÒNG NÀY
  }
}