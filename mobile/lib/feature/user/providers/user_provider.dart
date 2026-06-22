import 'package:flutter/material.dart';
import 'package:mobile/core/socket/index_socket.dart';
import 'package:mobile/core/storage/storage_service.dart';
import 'package:mobile/feature/user/repositories/user_repository.dart';
import '../models/user_model.dart';

class UserProvider extends ChangeNotifier {
  final UserRepository _repo;
  final IndexSocket _indexSocket;
  final StorageService _storageService;

  UserProvider(this._repo, this._indexSocket, this._storageService);

  UserModel? _user;
  UserModel? get user => _user;

  bool _loading = false;
  bool get loading => _loading;

  bool get isLoggedIn => _user != null;

  bool get isRescuer => _user?.role == 'RESCUER';

  String? get userId => _user?.userId;

  String? get role => _user?.role;

  Future<void> getProfile() async {
    _loading = true;
    notifyListeners();

    try {
      _user = await _repo.getProfile();
      final token = await _storageService.getAccessToken();
      if (token == null) return;

      _indexSocket.connect(token);

      if (isRescuer) {
        _indexSocket.heartbeat.start(userId!);
        _indexSocket.location.start(userId!);
      }
      
    } catch (e) {
      debugPrint("ERROR: $e");
      rethrow;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  void clear() {
    _user = null;
    notifyListeners();
  }
}