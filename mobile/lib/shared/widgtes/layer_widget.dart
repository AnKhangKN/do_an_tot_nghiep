import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/color_constants.dart';
import '../providers/map_layer_provider.dart';

class LayerWidget extends StatelessWidget {
  const LayerWidget({super.key});

  void _showLayerSelectionBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          decoration: BoxDecoration(
            color: ColorConstants.surfaceWhite,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            boxShadow: [
              BoxShadow(
                color: ColorConstants.shadowDark,
                blurRadius: 20,
                offset: Offset(0, -4),
              ),
            ],
          ),
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
          child: Consumer<MapLayerProvider>(
            builder: (context, layerProvider, _) {
              return Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Thanh kéo handle
                  Center(
                    child: Container(
                      width: 36,
                      height: 4,
                      decoration: BoxDecoration(
                        color: ColorConstants.borderDark,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Icon(Icons.layers_rounded, color: ColorConstants.slateDark, size: 22),
                      const SizedBox(width: 8),
                      Text(
                        'Hiển thị trên bản đồ',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: ColorConstants.slateDark,
                        ),
                      ),
                      const Spacer(),
                      IconButton(
                        onPressed: () => Navigator.pop(context),
                        icon: const Icon(Icons.close, size: 20),
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Divider(height: 1),
                  const SizedBox(height: 8),
                  // Lựa chọn 1: Cảnh báo nguy hiểm
                  _LayerOptionTile(
                    title: 'Cảnh báo nguy hiểm',
                    subtitle: 'Hiển thị các vị trí rủi ro, ngập lụt, mương hở...',
                    icon: Icons.warning_amber_rounded,
                    iconColor: ColorConstants.danger,
                    value: layerProvider.showDangerousPoints,
                    onChanged: (val) => layerProvider.toggleDangerousPoints(val),
                  ),
                  const SizedBox(height: 4),
                  // Lựa chọn 2: Icon tiện ích
                  _LayerOptionTile(
                    title: 'Icon tiện ích cộng đồng',
                    subtitle: 'Hiển thị cây xăng, tiệm sửa xe, y tế, cứu hộ...',
                    icon: Icons.storefront_rounded,
                    iconColor: ColorConstants.amenityGreen,
                    value: layerProvider.showAmenities,
                    onChanged: (val) => layerProvider.toggleAmenities(val),
                  ),
                ],
              );
            },
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final layerProvider = context.watch<MapLayerProvider>();
    final hasActiveExtraLayer = layerProvider.showAmenities;

    return Container(
      height: 38,
      width: 38,
      margin: const EdgeInsets.symmetric(vertical: 4),
      decoration: BoxDecoration(
        color: ColorConstants.surfaceWhite,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: hasActiveExtraLayer ? ColorConstants.amenityGreen : Colors.black.withValues(alpha: 0.08),
          width: hasActiveExtraLayer ? 1.5 : 1.0,
        ),
        boxShadow: const [
          BoxShadow(
            color: ColorConstants.shadowDark,
            blurRadius: 6,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: IconButton(
        padding: EdgeInsets.zero,
        constraints: const BoxConstraints(),
        tooltip: 'Lớp bản đồ',
        icon: Stack(
          alignment: Alignment.center,
          children: [
            Icon(
              Icons.layers_rounded,
              color: hasActiveExtraLayer ? ColorConstants.amenityGreen : ColorConstants.slateDark,
              size: 22,
            ),
            if (hasActiveExtraLayer)
              Positioned(
                top: 0,
                right: 0,
                child: Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: ColorConstants.amenityGreen,
                    shape: BoxShape.circle,
                  ),
                ),
              ),
          ],
        ),
        onPressed: () => _showLayerSelectionBottomSheet(context),
      ),
    );
  }
}

class _LayerOptionTile extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color iconColor;
  final bool value;
  final ValueChanged<bool> onChanged;

  const _LayerOptionTile({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.iconColor,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => onChanged(!value),
      borderRadius: BorderRadius.circular(14),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: iconColor.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: iconColor, size: 22),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: ColorConstants.textPrimary,
                    ),
                  ),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 11,
                      color: ColorConstants.textMuted,
                    ),
                  ),
                ],
              ),
            ),
            Switch(
              value: value,
              activeColor: iconColor,
              onChanged: onChanged,
            ),
          ],
        ),
      ),
    );
  }
}
