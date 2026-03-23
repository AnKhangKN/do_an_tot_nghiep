import 'package:flutter/material.dart';
import 'package:mobile/config/routes/app.router.dart';

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      title: 'CỨU HỘ',
      theme: ThemeData.light(),
      routerConfig: AppRouter.goRouter,
    );
  }
}
