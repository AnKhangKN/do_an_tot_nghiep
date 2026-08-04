import 'package:geolocator/geolocator.dart';

enum UserRole { victim, rescuer }

class SessionState {
  final bool isLoggedIn;
  final bool isOnline;
  final UserRole? role;
  final Position? position;
  final bool isProcessing;
  // Trạng thái đang tìm cứu hộ viên (dành cho Victim)
  final bool isSearchingRescuer;
  // Cờ nhận biết người dùng hiện tại là tài khoản khách (Guest)
  final bool isGuest;

  const SessionState({
    required this.isLoggedIn,
    required this.isOnline,
    required this.role,
    this.position,
    required this.isProcessing,
    this.isSearchingRescuer = false,
    this.isGuest = false,
  });

  factory SessionState.initial() {
    return const SessionState(
      isLoggedIn: false,
      isOnline: false,
      role: null,
      position: null,
      isProcessing: false,
      isSearchingRescuer: false,
      isGuest: false,
    );
  }

  SessionState copyWith({
    bool? isLoggedIn,
    bool? isOnline,
    UserRole? role,
    Position? position,
    bool? isProcessing,
    bool? isSearchingRescuer,
    bool? isGuest,
  }) {
    return SessionState(
      isLoggedIn: isLoggedIn ?? this.isLoggedIn,
      isOnline: isOnline ?? this.isOnline,
      role: role ?? this.role,
      position: position ?? this.position,
      isProcessing: isProcessing ?? this.isProcessing,
      isSearchingRescuer: isSearchingRescuer ?? this.isSearchingRescuer,
      isGuest: isGuest ?? this.isGuest,
    );
  }
}