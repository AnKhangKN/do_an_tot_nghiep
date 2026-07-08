class SocketEvents {
  // =========================
  // AUTH / CONNECTION
  // =========================
  static const connect = "connect";
  static const disconnect = "disconnect";

  static const goOnline = "rescuer:online";
  static const goOffline = "rescuer:offline";

  // =========================
  // SOS EVENTS
  // =========================
  static const sosEmit = "sos:emit";
  static const sosCancel = "sos:cancel";
  static const sosOffer = "sos:offer";

  // =========================
  // LOCATION
  // =========================
  static const locationUpdate = "rescuer:location:update";

  // =========================
  // RESCUE FLOW
  // =========================
  static const rescueAccept = "rescue:accept";
  static const rescueReject = "rescue:reject";
  static const rescueAssign = "rescue:assign";
  static const rescueComplete = "rescue:complete";

  // =========================
  // HEARTBEAT
  // =========================
  static const heartbeat = "rescuer:heartbeat";
}