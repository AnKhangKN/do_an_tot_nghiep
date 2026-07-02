import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConstants {
  static const urlTemplateDefault = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  static const urlTemplateWorldImagery = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
  static const urlTemplateDark = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

  static String baseUrl = dotenv.env['BACKEND_URL']!;
}