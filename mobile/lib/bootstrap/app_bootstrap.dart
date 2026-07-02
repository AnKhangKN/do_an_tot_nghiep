import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:mobile/core/di/di.dart';

class AppBootstrap {
  static Future<void> init() async {
    // load env
    await dotenv.load(fileName: ".env");

    // init DI
    await initDI();
  }
}