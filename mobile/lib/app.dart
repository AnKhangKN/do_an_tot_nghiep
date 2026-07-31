import 'package:flutter/material.dart';
import 'package:mobile/core/di/di.dart';
import 'package:mobile/core/theme/theme_controller.dart';
import 'package:mobile/routes/app_router.dart';
import 'shared/providers/app_providers.dart';

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return AppProviders(
      child: ListenableBuilder(
        listenable: getIt<ThemeController>(),
        builder: (context, _) {
          return MaterialApp.router(
            debugShowCheckedModeBanner: false,
            title: 'CỨU HỘ NHANH',
            theme: ThemeData.light(),
            darkTheme: ThemeData.dark(),
            themeMode: getIt<ThemeController>().themeMode,
            routerConfig: AppRouter.router,
          );
        },
      ),
    );
  }
}
