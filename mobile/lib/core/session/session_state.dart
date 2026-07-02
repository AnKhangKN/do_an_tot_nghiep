import 'package:geolocator/geolocator.dart';

enum UserRole { victim, rescuer }

class SessionState {
  final bool isLoggedIn;
  final bool isOnline;
  final UserRole? role;
  final Position? position;

  const SessionState({
    required this.isLoggedIn,
    required this.isOnline,
    required this.role,
    this.position,
  });

  factory SessionState.initial() {
    return const SessionState(
      isLoggedIn: false,
      isOnline: false,
      role: null,
      position: null,
    );
  }

  SessionState copyWith({
    bool? isLoggedIn,
    bool? isOnline,
    UserRole? role,
    Position? position,
  }) {
    return SessionState(
      isLoggedIn: isLoggedIn ?? this.isLoggedIn,
      isOnline: isOnline ?? this.isOnline,
      role: role ?? this.role,
      position: position ?? this.position,
    );
  }
}