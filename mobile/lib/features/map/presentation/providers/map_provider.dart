import 'package:flutter/material.dart';

import '../../../../core/location/data/location_repository.dart';

class MapProvider extends ChangeNotifier {
  final LocationRepository _locationRepository;

  MapProvider(this._locationRepository);

  bool _initialized = false;

  Future<void> init() async {
    if (_initialized) return;

    _initialized = true;

    await _locationRepository.loadCurrentPosition();
  }
}