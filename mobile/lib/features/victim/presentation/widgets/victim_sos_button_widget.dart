import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/victim_map_provider.dart';

class VictimSosButtonWidget extends StatefulWidget {
  final double? victimLat;
  final double? victimLng;

  const VictimSosButtonWidget({
    super.key,
    required this.victimLat,
    required this.victimLng,
  });

  @override
  State<VictimSosButtonWidget> createState() =>
      _VictimSosButtonWidgetState();
}

class _VictimSosButtonWidgetState
    extends State<VictimSosButtonWidget> {
  final TextEditingController phoneController =
  TextEditingController();

  final TextEditingController descriptionController =
  TextEditingController();

  String? selectedIncidentTypeId;

  @override
  void dispose() {
    phoneController.dispose();
    descriptionController.dispose();
    super.dispose();
  }

  void _showSosForm() {
    context.read<VictimMapProvider>().loadIncidentTypes();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      enableDrag: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setBottomSheetState) {
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
                      MediaQuery.of(context).viewInsets.bottom +
                          20,
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
                              borderRadius:
                              BorderRadius.circular(10),
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

                        const SizedBox(height: 16),

                        TextField(
                          controller: phoneController,
                          keyboardType: TextInputType.phone,
                          decoration: InputDecoration(
                            labelText: "Số điện thoại",
                            border: OutlineInputBorder(
                              borderRadius:
                              BorderRadius.circular(12),
                            ),
                          ),
                        ),

                        const SizedBox(height: 16),

                        Consumer<VictimMapProvider>(
                          builder: (context, provider, child) {
                            if (provider.loadingIncidentTypes) {
                              return const Center(
                                child:
                                CircularProgressIndicator(),
                              );
                            }

                            return DropdownButtonFormField<
                                String>(
                              value: selectedIncidentTypeId,
                              decoration: InputDecoration(
                                labelText: "Loại sự cố",
                                border: OutlineInputBorder(
                                  borderRadius:
                                  BorderRadius.circular(12),
                                ),
                              ),
                              items: provider.incidentTypes
                                  .map(
                                    (item) =>
                                    DropdownMenuItem<String>(
                                      value:
                                      item.incidentTypeId,
                                      child: Text(item.incidentType),
                                    ),
                              )
                                  .toList(),
                              onChanged: (value) {
                                setBottomSheetState(() {
                                  selectedIncidentTypeId =
                                      value;
                                });
                              },
                            );
                          },
                        ),

                        const SizedBox(height: 16),

                        TextField(
                          controller: descriptionController,
                          maxLines: 4,
                          decoration: InputDecoration(
                            labelText: "Mô tả chi tiết",
                            border: OutlineInputBorder(
                              borderRadius:
                              BorderRadius.circular(12),
                            ),
                          ),
                        ),

                        const SizedBox(height: 30),

                        Consumer<VictimMapProvider>(
                          builder: (context, provider, child) {
                            return SizedBox(
                              height: 55,
                              child: ElevatedButton(
                                onPressed: provider.loading
                                    ? null
                                    : () async {
                                  if (selectedIncidentTypeId ==
                                      null) {
                                    ScaffoldMessenger.of(
                                        context)
                                        .showSnackBar(
                                      const SnackBar(
                                        content: Text(
                                          "Vui lòng chọn loại sự cố",
                                        ),
                                      ),
                                    );
                                    return;
                                  }

                                  if (widget.victimLat == null || widget.victimLng == null) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(
                                        content: Text(
                                          "Không thể xác định vị trí hiện tại của bạn. Vui lòng bật định vị GPS!",
                                        ),
                                      ),
                                    );
                                    return;
                                  }

                                  final success =
                                  await provider.sendSos(
                                    phoneController.text
                                        .trim(),
                                    selectedIncidentTypeId!,
                                    descriptionController
                                        .text
                                        .trim()
                                        .isEmpty
                                        ? null
                                        : descriptionController
                                        .text
                                        .trim(),
                                    widget.victimLat!,
                                    widget.victimLng!,
                                  );

                                  if (!mounted) return;

                                  if (success) {
                                    Navigator.pop(
                                        context);

                                    ScaffoldMessenger.of(
                                        context)
                                        .showSnackBar(
                                      const SnackBar(
                                        content: Text(
                                          "Đã gửi yêu cầu cứu hộ",
                                        ),
                                      ),
                                    );
                                  } else {
                                    ScaffoldMessenger.of(
                                        context)
                                        .showSnackBar(
                                      const SnackBar(
                                        content: Text(
                                          "Gửi yêu cầu thất bại",
                                        ),
                                      ),
                                    );
                                  }
                                },
                                style:
                                ElevatedButton.styleFrom(
                                  backgroundColor:
                                  const Color(
                                      0xFFDC2626),
                                  shape:
                                  RoundedRectangleBorder(
                                    borderRadius:
                                    BorderRadius.circular(
                                        12),
                                  ),
                                ),
                                child: provider.loading
                                    ? const SizedBox(
                                  width: 24,
                                  height: 24,
                                  child:
                                  CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white,
                                  ),
                                )
                                    : const Text(
                                  "GỬI YÊU CẦU",
                                  style: TextStyle(
                                    color:
                                    Colors.white,
                                    fontWeight:
                                    FontWeight.bold,
                                  ),
                                ),
                              ),
                            );
                          },
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
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 52,
      width: 150,
      padding:
      const EdgeInsets.symmetric(horizontal: 4),
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
          foregroundColor:
          const Color(0xFFDC2626),
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