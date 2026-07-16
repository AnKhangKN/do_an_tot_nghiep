import 'package:flutter/material.dart';
import 'package:mobile/app.dart';
import 'bootstrap/app_bootstrap.dart';

void main() async {
  // Khởi tạo Flutter Binding
  WidgetsFlutterBinding.ensureInitialized();

  try {
    await AppBootstrap.init();
  } catch (e) {
    debugPrint('Bootstrap error: $e');
  }

  runApp(const App());
}