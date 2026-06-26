import 'package:flutter/material.dart';

import 'app.dart';
import 'core/di/di.dart';
import 'core/provider/app_providers.dart';

Future<Widget> bootstrap() async {
  await setupDI();

  return AppProviders(child: const App());
}
