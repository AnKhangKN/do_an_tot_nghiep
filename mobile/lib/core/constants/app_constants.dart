import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConstants {
  static const urlTemplate = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

  static String baseUrl = dotenv.env['BACKEND_URL']!;
}