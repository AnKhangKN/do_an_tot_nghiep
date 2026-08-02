import 'package:get_it/get_it.dart';
import 'package:mobile/core/session/app_session.dart';
import 'package:mobile/core/session/session_controller.dart';
import 'package:mobile/core/socket/core_socket.dart';
import 'package:mobile/core/socket/socket_events.dart';

/// Lắng nghe sự kiện "single active session" từ server:
/// - [SocketEvents.userKicked]: thiết bị cũ bị kick (có thiết bị khác đăng nhập).
/// - [SocketEvents.sessionBlocked]: thiết bị mới bị chặn (đang trong ca cứu hộ ở thiết bị khác).
/// Cả 2 trường hợp đều phải TỰ logout ngay lập tức (không chờ người dùng) để ngắt
/// auto-reconnect của socket, tránh vòng lặp kick qua lại (ping-pong) giữa 2 thiết bị.
/// Lý do sẽ được hiển thị trên màn hình Login.
class SessionSocket {
  final CoreSocket _socket;
  final SessionController _sessionController;

  SessionSocket(this._socket, this._sessionController);

  void listenSessionKicked() {
    _socket.on(SocketEvents.userKicked, (data) {
      final message = data is Map ? data['message']?.toString() : null;
      _handleForceLogout(
        message ?? 'Tài khoản của bạn đã được đăng nhập trên thiết bị khác.',
      );
    });
  }

  void listenSessionBlocked() {
    _socket.on(SocketEvents.sessionBlocked, (data) {
      final message = data is Map ? data['message']?.toString() : null;
      _handleForceLogout(
        message ?? 'Tài khoản của bạn đang tham gia ca cứu hộ trên thiết bị khác. Vui lòng đăng nhập lại sau khi ca cứu hộ kết thúc.',
      );
    });
  }

  void _handleForceLogout(String message) {
    _sessionController.setKickedFromOtherDevice(message);
    GetIt.instance<AppSession>().logout();
  }

  void stopListening() {
    _socket.off(SocketEvents.userKicked);
    _socket.off(SocketEvents.sessionBlocked);
  }
}
