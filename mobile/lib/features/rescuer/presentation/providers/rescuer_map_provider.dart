import 'package:flutter/material.dart';
import 'package:mobile/core/location/data/location_repository.dart';
import 'package:mobile/core/session/app_session.dart';
import '../../../../core/background/background_service.dart';

class RescuerMapProvider extends ChangeNotifier {
  final AppSession _appSession;
  final LocationRepository locationRepository;

  RescuerMapProvider(this._appSession, this.locationRepository);

  bool _loading = false;
  String? _error;

  bool get loading => _loading;
  String? get error => _error;

  void clearError() {
    _error = null;
    notifyListeners();
  }

  Future<void> goOnline() async {
    _setLoading(true);
    _error = null;

    try {
      await _appSession.goOnline();

      notifyListeners();
    } catch (e) {
      _error = e.toString().replaceFirst("Exception: ", "");
      notifyListeners();
      debugPrint("goOnline error: $e");
    } finally {
      _setLoading(false);
    }
  }

  Future<void> goOffline() async {
    _setLoading(true);

    try {
      await _appSession.goOffline();

      notifyListeners();
    } catch (e) {
      debugPrint("goOffline error: $e");
    } finally {
      _setLoading(false);
    }
  }

  void _setLoading(bool value) {
    _loading = value;
    notifyListeners();
  }
}
