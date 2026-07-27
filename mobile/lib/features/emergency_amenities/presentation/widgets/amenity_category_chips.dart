import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/amenity_provider.dart';

class AmenityCategoryChips extends StatelessWidget {
  const AmenityCategoryChips({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AmenityProvider>(
      builder: (context, provider, child) {
        final categories = provider.categories;
        if (categories.isEmpty && !provider.isLoadingCategories) {
          return const SizedBox.shrink();
        }

        return Container(
          height: 38,
          margin: const EdgeInsets.symmetric(vertical: 6),
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            children: [
              // "Tất cả" chip
              Padding(
                padding: const EdgeInsets.only(right: 8),
                child: FilterChip(
                  label: const Text('Tất cả tiện ích'),
                  selected: provider.selectedCategoryId == null,
                  selectedColor: Colors.black87,
                  labelStyle: TextStyle(
                    color: provider.selectedCategoryId == null ? Colors.white : Colors.black87,
                    fontWeight: FontWeight.w600,
                    fontSize: 12,
                  ),
                  backgroundColor: Colors.white,
                  elevation: 2,
                  shadowColor: Colors.black12,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                    side: BorderSide(
                      color: provider.selectedCategoryId == null ? Colors.transparent : Colors.grey[300]!,
                    ),
                  ),
                  onSelected: (_) => provider.selectCategory(null),
                ),
              ),
              ...categories.map((cat) {
                final isSelected = provider.selectedCategoryId == cat.amenityCategoryId;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(cat.categoryName),
                    selected: isSelected,
                    selectedColor: Colors.black87,
                    labelStyle: TextStyle(
                      color: isSelected ? Colors.white : Colors.black87,
                      fontWeight: FontWeight.w600,
                      fontSize: 12,
                    ),
                    backgroundColor: Colors.white,
                    elevation: 2,
                    shadowColor: Colors.black12,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                      side: BorderSide(
                        color: isSelected ? Colors.transparent : Colors.grey[300]!,
                      ),
                    ),
                    onSelected: (_) => provider.selectCategory(cat.amenityCategoryId),
                  ),
                );
              }),
            ],
          ),
        );
      },
    );
  }
}
