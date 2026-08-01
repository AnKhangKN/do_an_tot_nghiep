import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConstants {
  static const urlTemplateDefault = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  static const urlTemplateDark = 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';

  static const googleMapsDirectionUrlPattern = 'https://www.google.com/maps/dir/?api=1&destination=';
  static const geoSchemePattern = 'geo:';

  static String getGoogleMapsDirectionUrl(double lat, double lng) {
    return 'https://www.google.com/maps/dir/?api=1&destination=$lat,$lng';
  }

  static String getGeoSchemeUrl(double lat, double lng) {
    return 'geo:$lat,$lng?q=$lat,$lng';
  }

  static String baseUrl = dotenv.env['BACKEND_URL']!;
}