import 'package:flutter/material.dart';
import 'package:mobile/routes/app_router.dart';
import 'shared/providers/app_providers.dart';

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return AppProviders(
      child: MaterialApp.router(
        debugShowCheckedModeBanner: false,
        title: 'CỨU HỘ NHANH',
        theme: ThemeData.light(),
        routerConfig: AppRouter.router,
      ),
    );
  }
}
