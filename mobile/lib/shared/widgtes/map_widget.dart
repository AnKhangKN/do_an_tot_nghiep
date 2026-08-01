import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart' hide LatLngTween;
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';
import 'package:mobile/shared/widgtes/user_marker_widget.dart';

import '../../core/constants/app_constants.dart';
import '../../core/di/di.dart';
import '../../core/animation/lat_lng_tween.dart';
import '../../core/theme/theme_controller.dart';

class MapWidget extends StatefulWidget {
  final MapController mapController;
  final Position? position;
  final LatLng? partnerPosition;
  final Widget? partnerMarkerChild;
  final List<Marker>? additionalMarkers;
  final List<Polyline>? polylines;

  const MapWidget({
    super.key,
    required this.mapController,
    required this.position,
    this.partnerPosition,
    this.partnerMarkerChild,
    this.additionalMarkers,
    this.polylines,
  });

  @override
  State<MapWidget> createState() => _MapWidgetState();
}

class _MapWidgetState extends State<MapWidget> with TickerProviderStateMixin {
  AnimationController? _myPositionController;
  AnimationController? _partnerPositionController;

  LatLng? _myCurrentLatLng;
  LatLng? _myTargetLatLng;
  LatLng? _myStartLatLng;

  LatLng? _partnerCurrentLatLng;
  LatLng? _partnerTargetLatLng;
  LatLng? _partnerStartLatLng;

  late LatLng _initialLatLng;
  late double _initialZoom;

  @override
  void initState() {
    super.initState();

    _myPositionController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 750),
    )..addListener(() {
        if (!mounted) return;
        setState(() {
          if (_myStartLatLng != null && _myTargetLatLng != null) {
            _myCurrentLatLng = LatLngTween(
              begin: _myStartLatLng,
              end: _myTargetLatLng,
            ).evaluate(_myPositionController!);
          }
        });
      });

    _partnerPositionController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 750),
    )..addListener(() {
        if (!mounted) return;
        setState(() {
          if (_partnerStartLatLng != null && _partnerTargetLatLng != null) {
            _partnerCurrentLatLng = LatLngTween(
              begin: _partnerStartLatLng,
              end: _partnerTargetLatLng,
            ).evaluate(_partnerPositionController!);
          }
        });
      });

    // Khởi tạo vị trí ban đầu
    if (widget.position != null) {
      _myCurrentLatLng = LatLng(widget.position!.latitude, widget.position!.longitude);
      _myTargetLatLng = _myCurrentLatLng;
      _initialLatLng = _myCurrentLatLng!;
      _initialZoom = 15;
    } else {
      _initialLatLng = const LatLng(10.0354, 105.7828);
      _initialZoom = 13;
    }

    if (widget.partnerPosition != null) {
      _partnerCurrentLatLng = widget.partnerPosition;
      _partnerTargetLatLng = _partnerCurrentLatLng;
    }
  }

  @override
  void didUpdateWidget(covariant MapWidget oldWidget) {
    super.didUpdateWidget(oldWidget);

    // Xử lý vị trí của mình
    if (widget.position != null) {
      final newMyLatLng = LatLng(widget.position!.latitude, widget.position!.longitude);
      if (_myTargetLatLng == null ||
          _myTargetLatLng!.latitude != newMyLatLng.latitude ||
          _myTargetLatLng!.longitude != newMyLatLng.longitude) {
        setState(() {
          _myStartLatLng = _myCurrentLatLng ?? newMyLatLng;
          _myTargetLatLng = newMyLatLng;
          _myCurrentLatLng = newMyLatLng;
        });
        _myPositionController?.forward(from: 0.0);
      }
    } else if (_myCurrentLatLng != null) {
      setState(() {
        _myCurrentLatLng = null;
        _myTargetLatLng = null;
      });
      _myPositionController?.stop();
    }

    // Xử lý vị trí của đối phương
    if (widget.partnerPosition != null) {
      final newPartnerLatLng = widget.partnerPosition!;
      if (_partnerTargetLatLng == null ||
          _partnerTargetLatLng!.latitude != newPartnerLatLng.latitude ||
          _partnerTargetLatLng!.longitude != newPartnerLatLng.longitude) {
        setState(() {
          _partnerStartLatLng = _partnerCurrentLatLng ?? newPartnerLatLng;
          _partnerTargetLatLng = newPartnerLatLng;
          _partnerCurrentLatLng = newPartnerLatLng;
        });
        _partnerPositionController?.forward(from: 0.0);
      }
    } else if (_partnerCurrentLatLng != null) {
      setState(() {
        _partnerCurrentLatLng = null;
        _partnerTargetLatLng = null;
      });
      _partnerPositionController?.stop();
    }
  }


  @override
  void dispose() {
    _myPositionController?.dispose();
    _partnerPositionController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FlutterMap(
      mapController: widget.mapController,
      options: MapOptions(
        initialCenter: _initialLatLng,
        initialZoom: _initialZoom,
      ),
      children: [
        ListenableBuilder(
          listenable: getIt<ThemeController>(),
          builder: (context, _) {
            final isDark = getIt<ThemeController>().isDark;
            return TileLayer(
              urlTemplate: isDark
                  ? AppConstants.urlTemplateDark
                  : AppConstants.urlTemplateDefault,
              userAgentPackageName: 'com.example.mobile',
              tileUpdateTransformer: TileUpdateTransformers.debounce(
                const Duration(milliseconds: 150),
              ),
            );
          },
        ),
        if (widget.polylines != null && widget.polylines!.isNotEmpty)
          PolylineLayer(polylines: widget.polylines!),
        MarkerLayer(
          markers: [
            if (_myCurrentLatLng != null)
              Marker(
                point: _myCurrentLatLng!,
                width: 60,
                height: 60,
                alignment: Alignment.center,
                child: const UserMarkerWidget(),
              ),
            if (_partnerCurrentLatLng != null && widget.partnerMarkerChild != null)
              Marker(
                point: _partnerCurrentLatLng!,
                width: 50,
                height: 50,
                alignment: Alignment.center,
                child: widget.partnerMarkerChild!,
              ),
            if (widget.additionalMarkers != null) ...widget.additionalMarkers!,
          ],
        ),
      ],
    );
  }
}
