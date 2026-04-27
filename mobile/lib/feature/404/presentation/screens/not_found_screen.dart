import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class NotFoundScreen extends StatelessWidget {
  const NotFoundScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          children: [
            Text("404"),

            ElevatedButton(
              onPressed: () {
                context.go('/map');
              },
              child: Text("Trở về"),
            ),
          ],
        ),
      ),
    );
  }
}
