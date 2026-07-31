import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mobile/core/di/di.dart';
import 'package:mobile/core/theme/theme_controller.dart';
import 'package:mobile/routes/app_router.dart';
import 'shared/providers/app_providers.dart';

class App extends StatelessWidget {
  const App({super.key});

  static ThemeData _buildLightTheme() {
    const Color primary = Color(0xFFE53935);
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primary,
        brightness: Brightness.light,
        primary: primary,
        surface: Colors.white,
        onSurface: const Color(0xFF212121),
      ),
      scaffoldBackgroundColor: const Color(0xFFF5F5F5),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.white,
        foregroundColor: Color(0xFF212121),
        elevation: 0,
        scrolledUnderElevation: 0.5,
        systemOverlayStyle: SystemUiOverlayStyle(
          statusBarColor: Colors.transparent,
          statusBarIconBrightness: Brightness.dark,
          statusBarBrightness: Brightness.light,
        ),
        titleTextStyle: TextStyle(
          color: Color(0xFF212121),
          fontSize: 18,
          fontWeight: FontWeight.bold,
        ),
        iconTheme: IconThemeData(color: Color(0xFF212121)),
      ),
      cardTheme: CardThemeData(
        color: Colors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(16))),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Color(0xFFF5F5F5),
        labelStyle: TextStyle(color: Color(0xFF757575)),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(12)),
          borderSide: BorderSide(color: Color(0xFFE5E7EB)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(12)),
          borderSide: BorderSide(color: Color(0xFFE5E7EB)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(12)),
          borderSide: BorderSide(color: primary, width: 1.5),
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: Color(0xFFF3F4F6),
        thickness: 1,
        space: 1,
      ),
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) return Colors.white;
          return const Color(0xFFBDBDBD);
        }),
        trackColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) return const Color(0xFF4CAF50);
          return const Color(0xFFE0E0E0);
        }),
      ),
      textTheme: const TextTheme(
        bodyLarge: TextStyle(color: Color(0xFF212121)),
        bodyMedium: TextStyle(color: Color(0xFF212121)),
        bodySmall: TextStyle(color: Color(0xFF757575)),
      ),
      iconTheme: const IconThemeData(color: Color(0xFF424242)),
      listTileTheme: const ListTileThemeData(
        iconColor: Color(0xFF616161),
      ),
    );
  }

  static ThemeData _buildDarkTheme() {
    const Color primary = Color(0xFFEF5350);
    const Color surface = Color(0xFF1C1C1E);
    const Color bg = Color(0xFF17181C);

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primary,
        brightness: Brightness.dark,
        primary: primary,
        surface: surface,
        onSurface: const Color(0xFFF2F2F7),
      ),
      scaffoldBackgroundColor: bg,
      appBarTheme: const AppBarTheme(
        backgroundColor: surface,
        foregroundColor: Color(0xFFF2F2F7),
        elevation: 0,
        scrolledUnderElevation: 0.5,
        systemOverlayStyle: SystemUiOverlayStyle(
          statusBarColor: Colors.transparent,
          statusBarIconBrightness: Brightness.light,
          statusBarBrightness: Brightness.dark,
        ),
        titleTextStyle: TextStyle(
          color: Color(0xFFF2F2F7),
          fontSize: 18,
          fontWeight: FontWeight.bold,
        ),
        iconTheme: IconThemeData(color: Color(0xFFF2F2F7)),
      ),
      cardTheme: const CardThemeData(
        color: surface,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(16))),
      ),
      inputDecorationTheme: const InputDecorationTheme(
        filled: true,
        fillColor: Color(0xFF2C2C2E),
        labelStyle: TextStyle(color: Color(0xFFAEAEB2)),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(12)),
          borderSide: BorderSide(color: Color(0xFF3A3D42)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(12)),
          borderSide: BorderSide(color: Color(0xFF3A3D42)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(12)),
          borderSide: BorderSide(color: primary, width: 1.5),
        ),
        hintStyle: TextStyle(color: Color(0xFF636366)),
      ),
      dividerTheme: const DividerThemeData(
        color: Color(0xFF2C2E33),
        thickness: 1,
        space: 1,
      ),
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) return Colors.white;
          return const Color(0xFF636366);
        }),
        trackColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) return const Color(0xFF32D74B);
          return const Color(0xFF3A3D42);
        }),
      ),
      textTheme: const TextTheme(
        bodyLarge: TextStyle(color: Color(0xFFF2F2F7)),
        bodyMedium: TextStyle(color: Color(0xFFF2F2F7)),
        bodySmall: TextStyle(color: Color(0xFFAEAEB2)),
      ),
      iconTheme: const IconThemeData(color: Color(0xFFAEAEB2)),
      listTileTheme: const ListTileThemeData(
        iconColor: Color(0xFFAEAEB2),
        tileColor: Colors.transparent,
      ),
      dialogTheme: const DialogThemeData(
        backgroundColor: surface,
        titleTextStyle: TextStyle(color: Color(0xFFF2F2F7), fontSize: 18, fontWeight: FontWeight.bold),
        contentTextStyle: TextStyle(color: Color(0xFFAEAEB2), fontSize: 14),
      ),
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: surface,
        modalBackgroundColor: surface,
      ),
      snackBarTheme: const SnackBarThemeData(
        backgroundColor: Color(0xFF2C2C2E),
        contentTextStyle: TextStyle(color: Color(0xFFF2F2F7)),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(12))),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AppProviders(
      child: ListenableBuilder(
        listenable: getIt<ThemeController>(),
        builder: (context, _) {
          return MaterialApp.router(
            debugShowCheckedModeBanner: false,
            title: 'CỨU HỘ NHANH',
            theme: _buildLightTheme(),
            darkTheme: _buildDarkTheme(),
            themeMode: getIt<ThemeController>().themeMode,
            routerConfig: AppRouter.router,
          );
        },
      ),
    );
  }
}
