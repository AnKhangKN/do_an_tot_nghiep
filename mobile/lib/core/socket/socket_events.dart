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
  static const sosNotFound = "sos:not_found";

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
  static const rescueCancel = "rescue:cancel";
  static const rescueCancelled = "rescue:cancelled";
  static const rescuerSuspended = "rescuer:suspended";
  static const victimCancelBlocked = "victim:cancel_blocked";

  // =========================
  // HEARTBEAT
  // =========================
  static const heartbeat = "rescuer:heartbeat";

  // =========================
  // BAN
  // =========================
  static const userBanned = "user:banned";
}