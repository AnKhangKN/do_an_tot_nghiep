import 'package:geolocator/geolocator.dart';

enum UserRole { victim, rescuer }

class SessionState {
  final bool isLoggedIn;
  final bool isOnline;
  final UserRole? role;
  final Position? position;
  final bool isProcessing;

  const SessionState({
    required this.isLoggedIn,
    required this.isOnline,
    required this.role,
    this.position,
    required this.isProcessing
  });

  factory SessionState.initial() {
    return const SessionState(
      isLoggedIn: false,
      isOnline: false,
      role: null,
      position: null,
        isProcessing: false
    );
  }

  SessionState copyWith({
    bool? isLoggedIn,
    bool? isOnline,
    UserRole? role,
    Position? position,
    bool? isProcessing
  }) {
    return SessionState(
      isLoggedIn: isLoggedIn ?? this.isLoggedIn,
      isOnline: isOnline ?? this.isOnline,
      role: role ?? this.role,
      position: position ?? this.position,
      isProcessing: isProcessing ?? this.isProcessing
    );
  }
}