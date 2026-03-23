import 'package:flutter/material.dart';

class HistoryListScreen extends StatelessWidget {
  const HistoryListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('notification'),),

      body: SafeArea(child: Center(child: Text("Notification"),)),
    );
  }
}
