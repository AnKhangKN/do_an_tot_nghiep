import 'package:flutter/material.dart';

class VictimSosButtonWidget extends StatefulWidget {
  const VictimSosButtonWidget({super.key});

  @override
  State<VictimSosButtonWidget> createState() => _SosButtonWidgetState();
}

class _SosButtonWidgetState extends State<VictimSosButtonWidget> {
  final TextEditingController nameController = TextEditingController();
  final TextEditingController phoneController = TextEditingController();
  final TextEditingController addressController = TextEditingController();
  final TextEditingController issueController = TextEditingController();

  @override
  void dispose() {
    nameController.dispose();
    phoneController.dispose();
    addressController.dispose();
    issueController.dispose();
    super.dispose();
  }

  void _showSosForm() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      enableDrag: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return DraggableScrollableSheet(
          initialChildSize: 0.8,
          minChildSize: 0.4,
          maxChildSize: 0.95,
          expand: false,
          builder: (context, scrollController) {
            return Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(
                  top: Radius.circular(24),
                ),
              ),
              child: Padding(
                padding: EdgeInsets.only(
                  left: 20,
                  right: 20,
                  top: 12,
                  bottom:
                  MediaQuery.of(context).viewInsets.bottom + 20,
                ),
                child: ListView(
                  controller: scrollController,
                  children: [
                    Center(
                      child: Container(
                        width: 50,
                        height: 5,
                        decoration: BoxDecoration(
                          color: Colors.grey.shade300,
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    ),

                    const SizedBox(height: 20),

                    const Text(
                      "Yêu cầu cứu hộ",
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                      ),
                    ),

                    const SizedBox(height: 24),

                    TextField(
                      controller: nameController,
                      decoration: InputDecoration(
                        labelText: "Họ và tên",
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),

                    const SizedBox(height: 16),

                    TextField(
                      controller: phoneController,
                      keyboardType: TextInputType.phone,
                      decoration: InputDecoration(
                        labelText: "Số điện thoại",
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),

                    const SizedBox(height: 16),

                    TextField(
                      controller: addressController,
                      decoration: InputDecoration(
                        labelText: "Địa chỉ hiện tại",
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),

                    const SizedBox(height: 16),

                    DropdownButtonFormField<String>(
                      decoration: InputDecoration(
                        labelText: "Loại sự cố",
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      items: const [
                        DropdownMenuItem(
                          value: "Tai nạn",
                          child: Text("Tai nạn"),
                        ),
                        DropdownMenuItem(
                          value: "Hỏng xe",
                          child: Text("Hỏng xe"),
                        ),
                        DropdownMenuItem(
                          value: "Khẩn cấp",
                          child: Text("Khẩn cấp"),
                        ),
                      ],
                      onChanged: (value) {},
                    ),

                    const SizedBox(height: 16),

                    TextField(
                      controller: issueController,
                      maxLines: 4,
                      decoration: InputDecoration(
                        labelText: "Mô tả chi tiết",
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),

                    const SizedBox(height: 30),

                    SizedBox(
                      height: 55,
                      child: ElevatedButton(
                        onPressed: () {
                          debugPrint(
                              "Tên: ${nameController.text}");
                          debugPrint(
                              "SĐT: ${phoneController.text}");
                          debugPrint(
                              "Địa chỉ: ${addressController.text}");
                          debugPrint(
                              "Mô tả: ${issueController.text}");

                          Navigator.pop(context);

                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text(
                                  "Đã gửi yêu cầu cứu hộ"),
                            ),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor:
                          const Color(0xFFDC2626),
                          shape: RoundedRectangleBorder(
                            borderRadius:
                            BorderRadius.circular(12),
                          ),
                        ),
                        child: const Text(
                          "GỬI YÊU CẦU",
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 20),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 52,
      width: 150,
      padding: const EdgeInsets.symmetric(horizontal: 4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(26),
        border: Border.all(
          color: const Color(0xFFDC2626),
          width: 1.4,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.12),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: TextButton(
        onPressed: _showSosForm,
        style: TextButton.styleFrom(
          padding: EdgeInsets.zero,
          foregroundColor: const Color(0xFFDC2626),
        ),
        child: Row(
          children: [
            Container(
              height: 40,
              width: 40,
              alignment: Alignment.center,
              decoration: const BoxDecoration(
                color: Color(0xFFDC2626),
                shape: BoxShape.circle,
              ),
              child: const Text(
                'SOS',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
            const SizedBox(width: 10),
            const Text(
              'Cứu hộ',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
      ),
    );
  }
}