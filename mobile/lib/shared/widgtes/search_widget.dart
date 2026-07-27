import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:provider/provider.dart';

import '../../core/constants/color_constants.dart';
import '../../core/session/session_controller.dart';
import '../../features/emergency_amenities/data/models/emergency_amenity_model.dart';
import '../../features/emergency_amenities/presentation/providers/amenity_provider.dart';
import '../../features/emergency_amenities/presentation/widgets/amenity_detail_bottom_sheet.dart';

class SearchWidget extends StatefulWidget {
  const SearchWidget({super.key});

  @override
  State<SearchWidget> createState() => _SearchWidgetState();
}

class _SearchWidgetState extends State<SearchWidget> {
  final TextEditingController _controller = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  bool _showSuggestions = false;
  String? _selectedCategoryFilterId;

  @override
  void initState() {
    super.initState();
    _focusNode.addListener(_onFocusChange);
  }

  void _onFocusChange() {
    if (_focusNode.hasFocus) {
      setState(() {
        _showSuggestions = true;
      });
      context.read<AmenityProvider>().setIsSearching(true);
    }
  }

  @override
  void dispose() {
    _focusNode.removeListener(_onFocusChange);
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _closeSearch() {
    _controller.clear();
    _focusNode.unfocus();
    setState(() {
      _selectedCategoryFilterId = null;
      _showSuggestions = false;
    });
    if (mounted) {
      context.read<AmenityProvider>().setIsSearching(false);
    }
  }

  void _onSearchChanged(String value) {
    setState(() {
      _showSuggestions = true;
    });
    if (!_focusNode.hasFocus) {
      context.read<AmenityProvider>().setIsSearching(true);
    }
  }

  void _selectAmenity(EmergencyAmenityModel amenity) {
    _closeSearch();

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => AmenityDetailBottomSheet(amenity: amenity),
    );
  }

  IconData _getCategoryIcon(String? categoryName) {
    final name = (categoryName ?? '').toLowerCase();
    if (name.contains('y tế') || name.contains('bệnh viện') || name.contains('thuốc') || name.contains('cấp cứu')) {
      return Icons.medical_services_rounded;
    }
    if (name.contains('trú ẩn') || name.contains('sơ tán') || name.contains('nhà')) {
      return Icons.night_shelter_rounded;
    }
    if (name.contains('sửa') || name.contains('xe') || name.contains('cứu hộ')) {
      return Icons.build_circle_rounded;
    }
    if (name.contains('ăn') || name.contains('nước') || name.contains('thực phẩm')) {
      return Icons.rice_bowl_rounded;
    }
    return Icons.storefront_rounded;
  }

  Color _getCategoryColor(String? categoryName) {
    final name = (categoryName ?? '').toLowerCase();
    if (name.contains('y tế') || name.contains('bệnh viện') || name.contains('cấp cứu')) {
      return ColorConstants.danger;
    }
    if (name.contains('trú ẩn') || name.contains('sơ tán')) {
      return ColorConstants.purpleQR;
    }
    if (name.contains('sửa') || name.contains('cứu hộ')) {
      return ColorConstants.dangerMedium;
    }
    return ColorConstants.amenityGreen;
  }

  @override
  Widget build(BuildContext context) {
    final amenityProvider = context.watch<AmenityProvider>();
    final allAmenities = amenityProvider.amenities;
    final categories = amenityProvider.categories;
    final userPos = context.watch<SessionController>().state.position;

    final keyword = _controller.text.trim().toLowerCase();

    // 1. Lọc theo từ khóa tìm kiếm & danh mục chọn nhanh từ CSDL
    final filtered = allAmenities.where((item) {
      if (_selectedCategoryFilterId != null && item.amenityCategoryId != _selectedCategoryFilterId) {
        return false;
      }
      if (keyword.isEmpty) return true;
      final cat = (item.categoryName ?? '').toLowerCase();
      final phone = (item.phone ?? '').toLowerCase();
      final reporter = (item.reporterName ?? '').toLowerCase();
      return cat.contains(keyword) || phone.contains(keyword) || reporter.contains(keyword);
    }).toList();

    // 2. Tính khoảng cách thực tế và sắp xếp ƯU TIÊN GẦN NHẤT ĐỨNG ĐẦU TỰ ĐỘNG
    final List<_AmenityWithDistance> sortedList = filtered.map((item) {
      double dist = 999999999;
      if (userPos != null) {
        dist = Geolocator.distanceBetween(
          userPos.latitude,
          userPos.longitude,
          item.latitude,
          item.longitude,
        );
      }
      return _AmenityWithDistance(amenity: item, distanceMeters: dist);
    }).toList();

    sortedList.sort((a, b) => a.distanceMeters.compareTo(b.distanceMeters));

    return TapRegion(
      onTapOutside: (_) {
        if (_showSuggestions || _focusNode.hasFocus) {
          _closeSearch();
        }
      },
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            height: 54,
            padding: const EdgeInsets.symmetric(horizontal: 14),
            decoration: BoxDecoration(
              color: ColorConstants.surfaceWhite,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: Colors.black.withValues(alpha: 0.06)),
              boxShadow: const [
                BoxShadow(
                  color: ColorConstants.shadowDark,
                  blurRadius: 18,
                  offset: Offset(0, 8),
                ),
              ],
            ),
            child: Row(
              children: [
                Container(
                  height: 34,
                  width: 34,
                  decoration: BoxDecoration(
                    color: ColorConstants.primaryLight,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.near_me_rounded,
                    color: ColorConstants.primary,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    controller: _controller,
                    focusNode: _focusNode,
                    onChanged: _onSearchChanged,
                    cursorColor: ColorConstants.primary,
                    style: const TextStyle(
                      color: ColorConstants.slateDark,
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                    decoration: const InputDecoration(
                      hintText: 'Tìm tiện ích gần bạn nhất...',
                      hintStyle: TextStyle(
                        color: ColorConstants.borderMuted,
                        fontSize: 14,
                        fontWeight: FontWeight.w400,
                      ),
                      border: InputBorder.none,
                      isDense: true,
                    ),
                  ),
                ),
                if (_controller.text.isNotEmpty || _selectedCategoryFilterId != null || _showSuggestions)
                  IconButton(
                    icon: const Icon(Icons.close_rounded, color: ColorConstants.textMuted, size: 20),
                    onPressed: _closeSearch,
                  ),
              ],
            ),
          ),
          if (_showSuggestions)
            Container(
              margin: const EdgeInsets.only(top: 8),
              constraints: const BoxConstraints(maxHeight: 320),
              clipBehavior: Clip.antiAlias,
              decoration: BoxDecoration(
                color: ColorConstants.surfaceWhite,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: Colors.black.withValues(alpha: 0.08)),
                boxShadow: const [
                  BoxShadow(
                    color: ColorConstants.shadowDark,
                    blurRadius: 20,
                    offset: Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // GỢI Ý DANH MỤC TỪ DATABASE (HORIZONTAL CHIPS)
                  if (categories.isNotEmpty) ...[
                    Padding(
                      padding: const EdgeInsets.fromLTRB(14, 10, 14, 4),
                      child: const Text(
                        'Gợi ý danh mục từ Hệ thống',
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: ColorConstants.textMuted),
                      ),
                    ),
                    SizedBox(
                      height: 36,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 10),
                        itemCount: categories.length + 1,
                        itemBuilder: (context, idx) {
                          if (idx == 0) {
                            final isAllSelected = _selectedCategoryFilterId == null;
                            return Padding(
                              padding: const EdgeInsets.only(right: 6),
                              child: FilterChip(
                                selected: isAllSelected,
                                label: const Text('Tất cả', style: TextStyle(fontSize: 12)),
                                selectedColor: ColorConstants.primary,
                                labelStyle: TextStyle(
                                  color: isAllSelected ? ColorConstants.surfaceWhite : ColorConstants.slateDark,
                                  fontWeight: FontWeight.bold,
                                ),
                                onSelected: (_) {
                                  setState(() {
                                    _selectedCategoryFilterId = null;
                                  });
                                },
                              ),
                            );
                          }

                          final cat = categories[idx - 1];
                          final isSelected = _selectedCategoryFilterId == cat.amenityCategoryId;
                          return Padding(
                            padding: const EdgeInsets.only(right: 6),
                            child: FilterChip(
                              selected: isSelected,
                              label: Text(cat.categoryName, style: const TextStyle(fontSize: 12)),
                              selectedColor: ColorConstants.primary,
                              labelStyle: TextStyle(
                                color: isSelected ? ColorConstants.surfaceWhite : ColorConstants.slateDark,
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                              ),
                              onSelected: (val) {
                                setState(() {
                                  _selectedCategoryFilterId = val ? cat.amenityCategoryId : null;
                                });
                              },
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 6),
                  ],

                  Padding(
                    padding: const EdgeInsets.fromLTRB(14, 6, 14, 6),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Tiện ích gần nhất (${sortedList.length})',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: ColorConstants.textMuted),
                        ),
                        GestureDetector(
                          onTap: _closeSearch,
                          child: const Text('Đóng', style: TextStyle(fontSize: 12, color: ColorConstants.primary, fontWeight: FontWeight.w600)),
                        ),
                      ],
                    ),
                  ),
                  const Divider(height: 1),
                  if (sortedList.isEmpty)
                    const Padding(
                      padding: EdgeInsets.all(16),
                      child: Center(
                        child: Text(
                          'Không tìm thấy tiện ích khẩn cấp phù hợp',
                          style: TextStyle(color: ColorConstants.textMuted, fontSize: 13),
                        ),
                      ),
                    )
                  else
                    Flexible(
                      child: ListView.separated(
                        shrinkWrap: true,
                        padding: EdgeInsets.zero,
                        itemCount: sortedList.length,
                        separatorBuilder: (_, __) => const Divider(height: 1),
                        itemBuilder: (context, index) {
                          final itemData = sortedList[index];
                          final item = itemData.amenity;
                          final catName = item.categoryName ?? 'Tiện ích khẩn cấp';
                          final icon = _getCategoryIcon(catName);
                          final iconColor = _getCategoryColor(catName);
                          final distText = itemData.formattedDistance;

                          return ListTile(
                            dense: true,
                            leading: Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: iconColor.withValues(alpha: 0.12),
                                shape: BoxShape.circle,
                              ),
                              child: Icon(icon, color: iconColor, size: 18),
                            ),
                            title: Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    catName,
                                    style: const TextStyle(
                                      color: ColorConstants.slateDark,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 14,
                                    ),
                                  ),
                                ),
                                if (distText.isNotEmpty)
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: ColorConstants.primaryLight,
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      distText,
                                      style: const TextStyle(
                                        color: ColorConstants.primary,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 11,
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                            subtitle: Text(
                              'Giờ mở cửa: ${item.openingHours}${item.phone != null && item.phone!.isNotEmpty ? ' • SĐT: ${item.phone}' : ''}',
                              style: const TextStyle(fontSize: 12, color: ColorConstants.textMuted),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: ColorConstants.borderMuted),
                            onTap: () => _selectAmenity(item),
                          );
                        },
                      ),
                    ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _AmenityWithDistance {
  final EmergencyAmenityModel amenity;
  final double distanceMeters;

  _AmenityWithDistance({
    required this.amenity,
    required this.distanceMeters,
  });

  String get formattedDistance {
    if (distanceMeters >= 999999000) return '';
    if (distanceMeters < 1000) {
      return 'Cách ${distanceMeters.toStringAsFixed(0)} m';
    } else {
      return 'Cách ${(distanceMeters / 1000).toStringAsFixed(1)} km';
    }
  }
}
