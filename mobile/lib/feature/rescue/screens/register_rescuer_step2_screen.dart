import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/register_rescuer_provider.dart';

class RegisterRescuerStep2Screen extends StatefulWidget {
  const RegisterRescuerStep2Screen({super.key});

  @override
  State<RegisterRescuerStep2Screen> createState() =>
      _RegisterRescuerStep2ScreenState();
}

class _RegisterRescuerStep2ScreenState
    extends State<RegisterRescuerStep2Screen> {
  String? incidentTypesId;

  final _area = TextEditingController();

  @override
  void dispose() {
    _area.dispose();
    super.dispose();
  }

  void submit() {
    if (incidentTypesId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng chọn loại cứu hộ')),
      );
      return;
    }

    context.read<RegisterRescuerProvider>().saveStep2(
      incidentTypesId: incidentTypesId!,
      area: _area.text.trim(),
    );

    final data = context.read<RegisterRescuerProvider>();

    debugPrint(data.fullName);
    debugPrint(data.email);
    debugPrint(data.phone);
    debugPrint(data.gender);
    debugPrint(data.area);
    debugPrint(data.incidentTypesId);

    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('Sẵn sàng gọi API')));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Thông tin cứu hộ')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            DropdownButtonFormField<String>(
              value: incidentTypesId,
              decoration: const InputDecoration(labelText: 'Loại cứu hộ'),
              items: const [
                DropdownMenuItem(value: '1', child: Text('Xe máy')),
                DropdownMenuItem(value: '2', child: Text('Ô tô')),
              ],
              onChanged: (value) {
                setState(() {
                  incidentTypesId = value;
                });
              },
            ),

            const SizedBox(height: 16),

            TextField(
              controller: _area,
              // maxLines: 4,
              decoration: const InputDecoration(labelText: 'Khu vực'),
            ),

            const SizedBox(height: 24),

            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: submit,
                child: const Text('Hoàn tất đăng ký'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
