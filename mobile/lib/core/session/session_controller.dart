import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:get_it/get_it.dart';
import 'package:latlong2/latlong.dart';
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

  Map<String, dynamic>? _activeRescuer;
  LatLng? _rescuerPosition;

  Map<String, dynamic>? get activeRescuer => _activeRescuer;
  LatLng? get rescuerPosition => _rescuerPosition;
  bool get isBeingRescued => _activeRescuer != null;

  bool _showSuccessRescueAlert = false;
  bool get showSuccessRescueAlert => _showSuccessRescueAlert;
  String? _completedSosRequestId;
  String? _completedRescuerName;
  String? get completedSosRequestId => _completedSosRequestId;
  String? get completedRescuerName => _completedRescuerName;

  void triggerSuccessAlert({String? sosRequestId, String? rescuerName}) {
    _showSuccessRescueAlert = true;
    _completedSosRequestId = sosRequestId ?? _activeRescuer?['sosRequestId'] ?? _activeRescuer?['sos_request_id'];
    _completedRescuerName = rescuerName ?? _activeRescuer?['fullName'] ?? _activeRescuer?['full_name'];
    notifyListeners();
    // Tự động tắt sau 15 giây
    Future.delayed(const Duration(seconds: 15), () {
      _showSuccessRescueAlert = false;
      notifyListeners();
    });
  }

  void dismissSuccessAlert() {
    _showSuccessRescueAlert = false;
    notifyListeners();
  }

  void startBeingRescued(Map<String, dynamic> rescuer, LatLng? initialPos) {
    _activeRescuer = rescuer;
    _rescuerPosition = initialPos;
    _state = _state.copyWith(isSearchingRescuer: false);
    notifyListeners();
  }

  void updateRescuerPosition(LatLng pos) {
    _rescuerPosition = pos;
    notifyListeners();
  }

  void endBeingRescued() {
    _activeRescuer = null;
    _rescuerPosition = null;
    notifyListeners();
  }

  void reset() {
    _state = SessionState.initial();
    _activeRescuer = null;
    _rescuerPosition = null;
    _showSuccessRescueAlert = false;
    _completedSosRequestId = null;
    _completedRescuerName = null;
    notifyListeners();
  }
}