import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class PhoneCallWidget extends StatelessWidget {
  final String phoneNumber;
  final double size;
  final Color color;

  const PhoneCallWidget({
    super.key,
    required this.phoneNumber,
    this.size = 28.0,
    this.color = Colors.green,
  });

  Future<void> _makePhoneCall(String number) async {
    final Uri launchUri = Uri(
      scheme: 'tel',
      path: number,
    );
    try {
      if (await canLaunchUrl(launchUri)) {
        await launchUrl(launchUri);
      } else {
        debugPrint('Could not launch $launchUri');
      }
    } catch (e) {
      debugPrint('Error launching phone dialer: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    if (phoneNumber.trim().isEmpty) {
      return const SizedBox.shrink();
    }

    return IconButton(
      icon: Icon(Icons.phone, color: color, size: size),
      onPressed: () => _makePhoneCall(phoneNumber),
    );
  }
}
