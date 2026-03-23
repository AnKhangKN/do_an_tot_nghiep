import 'package:flutter/material.dart';

class NotificationScreen extends StatelessWidget {
  const NotificationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('notification'),),
      
      body: SafeArea(child: Center(child: Text("Notification"),)),
    );
  }
}
