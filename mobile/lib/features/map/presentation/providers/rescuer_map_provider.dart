import 'package:flutter/material.dart';
import 'package:mobile/core/location/data/location_repository.dart';
import 'package:mobile/core/session/app_session.dart';
import '../../../../core/background/background_service.dart';

class RescuerMapProvider extends ChangeNotifier {
  final AppSession _appSession;
  final LocationRepository locationRepository;

  RescuerMapProvider(this._appSession, this.locationRepository);

  bool _loading = false;
  bool _isOnline = false;

  bool get loading => _loading;
  bool get isOnline => _isOnline;

  Future<void> goOnline() async {
    _setLoading(true);

    try {
      final granted = await locationRepository.ensureLocationPermission();

      print("Granted: ${granted}");

      if (!granted) {
        print("Ứng dụng cần truy cập vị trí!");
        return;
      }

      bool isSuccess = await _appSession.goOnline();

      if (isSuccess) {
        _isOnline = true;
      } else {
        _isOnline = false;
      }

      notifyListeners();
    } catch (e) {
      debugPrint("goOnline error: $e");
    } finally {
      _setLoading(false);
    }
  }

  Future<void> goOffline() async {
    _setLoading(true);

    try {
      bool isSuccess = await _appSession.goOffline();

      if (isSuccess) {
        _isOnline = false;
      } else {
        _isOnline = true;
      }

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
