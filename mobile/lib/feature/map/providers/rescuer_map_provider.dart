import 'package:flutter/material.dart';

import '../../../core/session/app_session.dart';
import '../../../core/socket/index_socket.dart';
import '../../../core/storage/storage_service.dart';

class RescuerMapProvider extends ChangeNotifier {
  final AppSession _session;

  RescuerMapProvider(this._session);

  bool _loading = false;
  bool _isOnline = false;

  bool get loading => _loading;
  bool get isOnline => _isOnline;

  Future<bool> goOnline() async {
    _loading = true;
    notifyListeners();

    try {
      final success = await _session.goOnline();
      if (success) {
        _isOnline = true;
      }
      return true;
    } catch (err) {
      debugPrint("ERROR: $err");
      return false;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<bool> goOffline() async {
    _loading = true;
    notifyListeners();
    try {
      final success = await _session.goOffline();

      if (success) {
        _isOnline = false;
      }

      return true;
    } catch (err) {
      debugPrint("ERROR: $err");
      return false;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }
}
