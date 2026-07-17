import 'package:flutter/material.dart';
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

    socket.on(SocketEvents.sosNotFound, (data) {
      debugPrint('🔴 [VICTIM SOCKET] Nhận sos:not_found: $data');
      sessionController.setSearchingRescuer(false);
    });
  }

  /// Hủy lắng nghe
  void stopListening() {
    socket.off(SocketEvents.sosNotFound);
  }
}
