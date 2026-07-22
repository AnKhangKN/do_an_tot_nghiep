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
    socket.off("rescue:accept:success");
    socket.off("rescue:completed");
    socket.off("sos:cancelled");
    socket.off("rescue:cancelled");

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

    socket.on("rescue:accept:success", (data) {
      debugPrint("🟢 [RESCUER SOCKET] Nhận rescue:accept:success: $data");
      if (data == null) return;

      try {
        final String sosId = data['sosRequestId'];
        final Map<String, dynamic> victim = Map<String, dynamic>.from(data['victim']);

        final sosOffer = SOSOfferModel(
          sosId: sosId,
          victimLat: victim['lat'] != null ? (victim['lat'] as num).toDouble() : 0.0,
          victimLng: victim['lng'] != null ? (victim['lng'] as num).toDouble() : 0.0,
          description: victim['description'],
          incidentTypeName: victim['incidentTypeName'] ?? victim['serviceType'] ?? data['incidentTypeName'],
        );

        sosProvider.startRescue(sosOffer, victim);
      } catch (e, s) {
        debugPrint("❌ [RESCUER SOCKET] Lỗi parse accept success: $e\n$s");
      }
    });

    socket.on("rescue:completed", (data) {
      debugPrint("🟢 [RESCUER SOCKET] Nhận rescue:completed: $data");
      sosProvider.endRescue();
      sosProvider.triggerSuccessAlert();
    });

    socket.on("sos:cancelled", (data) {
      debugPrint("🚨 [RESCUER SOCKET] Nhận sos:cancelled: $data");
      final String? cancelledSosId = data != null ? (data['sosRequestId'] ?? data['sosId'])?.toString() : null;
      final String? msg = data != null && data['message'] != null
          ? data['message'].toString()
          : "Người gặp nạn đã dừng yêu cầu cứu hộ.";
      sosProvider.handleSosCancelled(cancelledSosId, message: msg);
    });

    socket.on("rescue:cancelled", (data) {
      debugPrint("🚨 [RESCUER SOCKET] Nhận rescue:cancelled: $data");
      final String? cancelledSosId = data != null ? (data['sosRequestId'] ?? data['sosId'])?.toString() : null;
      final String? msg = data != null && data['message'] != null
          ? data['message'].toString()
          : "Người gặp nạn đã dừng yêu cầu cứu hộ.";
      sosProvider.handleSosCancelled(cancelledSosId, message: msg);
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
    socket.off("sos:offer");
    socket.off("rescue:accept:success");
    socket.off("rescue:completed");
    socket.off("sos:cancelled");
    socket.off("rescue:cancelled");
  }
}
