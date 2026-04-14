import 'package:flutter/material.dart';

import 'core/navigation/widgets/bottom_nav_bar_widget.dart';
import 'core/routes/app_router.dart';

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
