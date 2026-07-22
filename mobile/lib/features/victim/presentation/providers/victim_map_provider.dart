import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:mobile/core/incident_types/data/incident_type_repository.dart';
import '../../../../core/incident_types/models/incident_type_model.dart';
import '../../../../core/di/di.dart';
import '../../../../core/session/session_controller.dart';
import '../../data/victim_repository.dart';
import '../../models/sos_request.dart';

class VictimMapProvider extends ChangeNotifier {
  final VictimRepository victimRepository;
  final IncidentTypeRepository incidentTypeRepository;

  VictimMapProvider(this.victimRepository, this.incidentTypeRepository);

  bool _loading = false;
  bool get loading => _loading;

  bool _loadingIncidentTypes = false;
  bool get loadingIncidentTypes => _loadingIncidentTypes;

  List<IncidentTypeModel> _incidentTypes = [];
  List<IncidentTypeModel> get incidentTypes => _incidentTypes;

  Future<void> loadIncidentTypes() async {
    _loadingIncidentTypes = true;
    notifyListeners();

    try {
      _incidentTypes = await incidentTypeRepository.getIncidentType();
      debugPrint("🟢 [PROVIDER] Load incident types thành công: ${_incidentTypes.length} bản ghi");
    } catch (e) {
      debugPrint("❌ [PROVIDER] Lỗi khi loadIncidentTypes: $e");
    } finally {
      _loadingIncidentTypes = false;
      notifyListeners();
    }
  }

  String? _activeSosRequestId;
  String? get activeSosRequestId => _activeSosRequestId;

  Future<bool> sendSos(
    String phone,
    String incidentTypeId,
    String? description,
    double victimLat,
    double victimLng,
  ) async {
    _loading = true;
    notifyListeners();

    try {
      final request = SosRequest(
        phone: phone,
        incidentTypeId: incidentTypeId,
        description: description,
        victimLat: victimLat,
        victimLng: victimLng,
      );

      debugPrint(request.toJson().toString());

      final resData = await victimRepository.sendSos(request);
      if (resData != null && resData['data'] != null) {
        _activeSosRequestId = (resData['data']['sos_request_id'] ?? resData['data']['sosRequestId'])?.toString();
        debugPrint("🟢 [PROVIDER] Lưu activeSosRequestId: $_activeSosRequestId");
      }

      // Cập nhật trạng thái đang tìm cứu hộ viên vào SessionController (state tập trung)
      getIt<SessionController>().setSearchingRescuer(true);

      return true;
    } catch (err) {
      debugPrint(err.toString());
      return false;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<bool> cancelSos({String? sosRequestId, String? cancelReason}) async {
    _loading = true;
    notifyListeners();

    final targetSosId = sosRequestId ?? _activeSosRequestId;

    try {
      await victimRepository.cancelSos(
        sosRequestId: targetSosId,
        cancelReason: cancelReason ?? 'Người gặp nạn chủ động hủy yêu cầu',
      );
      _activeSosRequestId = null;
      getIt<SessionController>().setSearchingRescuer(false);
      return true;
    } catch (err) {
      debugPrint("❌ [PROVIDER] Lỗi khi cancelSos: $err");
      _activeSosRequestId = null;
      // Dù API gặp lỗi thì cũng đặt lại state local về false để cho phép nạn nhân thao tác lại
      getIt<SessionController>().setSearchingRescuer(false);
      return false;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }
}
