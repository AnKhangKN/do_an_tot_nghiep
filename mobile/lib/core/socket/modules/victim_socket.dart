import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';
import '../../session/session_controller.dart';
import '../core_socket.dart';
import '../socket_events.dart';

/// Module socket dành riêng cho Victim.
/// Lắng nghe các sự kiện liên quan đến nạn nhân và cập nhật state qua SessionController.
class VictimSocket {
  final CoreSocket socket;
  final SessionController sessionController;

  VictimSocket(this.socket, this.sessionController);

  /// Bắt đầu lắng nghe sự kiện sos:not_found
  /// Khi server không tìm được rescuer sau tất cả attempt → reset trạng thái tìm kiếm
  void listenSosNotFound() {
    socket.off(SocketEvents.sosNotFound);
    socket.off("rescue:accepted");
    socket.off("rescuer:location:updated");

    socket.on(SocketEvents.sosNotFound, (data) {
      debugPrint('🔴 [VICTIM SOCKET] Nhận sos:not_found: $data');
      sessionController.setSearchingRescuer(false);
    });

    socket.on("rescue:accepted", (data) {
      debugPrint('🟢 [VICTIM SOCKET] Nhận rescue:accepted: $data');
      if (data != null) {
        final rescuer = Map<String, dynamic>.from(data['rescuer'] ?? {});
        rescuer['sosRequestId'] = data['sosRequestId'] ?? data['sos_request_id'] ?? data['sosId'] ?? data['sos_id'] ?? rescuer['sosRequestId'] ?? rescuer['sos_request_id'];
        final double? lat = rescuer['lat'] != null ? (rescuer['lat'] as num).toDouble() : null;
        final double? lng = rescuer['lng'] != null ? (rescuer['lng'] as num).toDouble() : null;
        
        LatLng? initialPos;
        if (lat != null && lng != null) {
          initialPos = LatLng(lat, lng);
        }
        
        sessionController.startBeingRescued(rescuer, initialPos);
      }
    });

    socket.on("rescuer:location:updated", (data) {
      debugPrint('🟢 [VICTIM SOCKET] Nhận rescuer:location:updated: $data');
      if (data != null) {
        final double lat = (data['lat'] as num).toDouble();
        final double lng = (data['lng'] as num).toDouble();
        sessionController.updateRescuerPosition(LatLng(lat, lng));
      }
    });

    socket.on("rescue:completed", (data) {
      debugPrint('🟢 [VICTIM SOCKET] Nhận rescue:completed: $data');
      sessionController.endBeingRescued();
      sessionController.triggerSuccessAlert();
    });
  }

  /// Hủy lắng nghe
  void stopListening() {
    socket.off(SocketEvents.sosNotFound);
    socket.off("rescue:accepted");
    socket.off("rescuer:location:updated");
    socket.off("rescue:completed");
  }
}
