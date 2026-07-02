import '../core/session/app_session.dart';

class RouteGuards {
  final AppSession _session;

  RouteGuards(this._session);

  // =========================
  // AUTH STATE (ONLY SESSION)
  // =========================
  bool get isLoggedIn => _session.isLoggedIn;

  // =========================
  // ROLE
  // =========================
  bool get isRescuer => _session.isRescuer;
  bool get isVictim => !_session.isRescuer;

  // =========================
  // HOME ROUTE
  // =========================
  String get homeRoute =>
      _session.isRescuer ? '/rescuer-map' : '/map';

  // =========================
  // ROUTE RULES
  // =========================
  bool canAccessAuth() {
    return !_session.isLoggedIn;
  }

  bool canAccessApp() {
    return _session.isLoggedIn && _session.isInitialized;
  }
}