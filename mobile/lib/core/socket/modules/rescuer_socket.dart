import 'package:flutter/material.dart';
import 'package:mobile/features/rescuer/presentation/providers/sos_provider.dart';
import '../../../features/rescuer/models/sos_offer_model.dart';
import '../core_socket.dart';
import '../socket_events.dart';

class RescuerSocket {
  final CoreSocket socket;
  final SOSProvider sosProvider;

  RescuerSocket(this.socket, this.sosProvider);

  void listenRescueRequests(Function(dynamic) onRequest) {
    socket.on(SocketEvents.sosEmit, (data) {
      onRequest(data);
    });
  }

  void listenSosOffer() {
    socket.off("sos:offer");

    socket.on("sos:offer", (data) {
      debugPrint("🚨 [RESCUER SOCKET] Raw Data: ${data.toString()}");

      if (data == null) return;

      try {
        final sos = SOSOfferModel.fromJson(
          Map<String, dynamic>.from(data),
        );

        // 4. Đẩy vào Provider/State để hiển thị màn hình nhận cuốc
        sosProvider.receiveSOS(sos);

      } catch (e, s) {
        debugPrint("❌ [PARSE ERROR] Lỗi chuyển đổi Model: $e");
        debugPrint("$s");
      }
    });
  }

  void acceptRescue(String incidentId) {
    socket.emit(SocketEvents.rescueAccept, {"incidentId": incidentId});
  }

  void rejectRescue(String incidentId) {
    socket.emit(SocketEvents.rescueReject, {"incidentId": incidentId});
  }

  void completeRescue(String incidentId) {
    socket.emit(SocketEvents.rescueComplete, {"incidentId": incidentId});
  }

  void stopListening() {
    socket.off(SocketEvents.sosEmit);
  }
}
