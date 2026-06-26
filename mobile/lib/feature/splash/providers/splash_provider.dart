import 'package:mobile/core/session/app_session.dart';
import 'package:mobile/core/storage/storage_service.dart';
import 'package:mobile/feature/auth/models/user_model.dart';

import '../../../core/bootstrap/app_bootstrap.dart';

enum SplashRoute {
  login,
  victim,
  rescuer,
}

class SplashProvider {
  final AppBootstrap bootstrap;
  final StorageService storageService;
  final AppSession appSession;

  UserModel? _user;
  UserModel? get user => _user;

  bool get isRescuer => _user?.role == "RESCUER";

  SplashProvider(this.bootstrap, this.storageService, this.appSession);

  Future<SplashRoute> init() async {
    final token = await storageService.getAccessToken();

    if (token == null || token.isEmpty) {
      return SplashRoute.login;
    }

    final me = await bootstrap.initialize();

    _user = me;

    if (me == null) {
      return SplashRoute.login;
    }

    if (me.role == "VICTIM") {
      await appSession.start(isRescuer: false);

      return SplashRoute.victim;
    }

    if (me.role == "RESCUER") {
      await appSession.start(isRescuer: true);

      return SplashRoute.rescuer;
    }

    await appSession.stop();

    return SplashRoute.login;
  }
}