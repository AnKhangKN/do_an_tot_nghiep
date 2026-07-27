import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/router_constants.dart';

class NotFoundScreen extends StatelessWidget {
  const NotFoundScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Column(
            children: [
              const Text("404"),

              ElevatedButton(
                onPressed: () {
                  context.go(RouterConstants.map);
                },
                child: const Text("Trở về"),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
