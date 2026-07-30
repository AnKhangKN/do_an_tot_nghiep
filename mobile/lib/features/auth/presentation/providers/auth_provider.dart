import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:mobile/core/session/app_session.dart';
import 'package:mobile/core/storage/storage_service.dart';

import 'package:dio/dio.dart';
import '../../../../core/session/session_state.dart';
import '../../data/auth_repository.dart';
import '../../models/login_request.dart';
import '../../models/register_request.dart';

class AuthProvider extends ChangeNotifier {
  final AuthRepository authRepository;
  final AppSession appSession;
  final StorageService storageService;

  AuthProvider(this.authRepository, this.appSession, this.storageService);

  bool isLoading = false;
  String? error;
  bool requireOtp = false;
  String? unverifiedEmail;

  void setError(String? message) {
    error = message;
    notifyListeners();
  }

  void clearError() {
    error = null;
    requireOtp = false;
    unverifiedEmail = null;
    notifyListeners();
  }

  String _parseError(dynamic e) {
    if (e is DioException) {
      if (e.response != null) {
        final data = e.response?.data;
        if (data is Map<String, dynamic>) {
          if (data['message'] != null && data['message'].toString().isNotEmpty) {
            return data['message'].toString();
          }
          if (data['error'] != null && data['error'].toString().isNotEmpty) {
            return data['error'].toString();
          }
        }
        if (e.response?.statusCode == 401) {
          return "Email hoặc mật khẩu không chính xác!";
        } else if (e.response?.statusCode == 400) {
          return "Thông tin đăng nhập không hợp lệ!";
        } else if (e.response?.statusCode == 404) {
          return "Không tìm thấy tài khoản!";
        } else if (e.response?.statusCode == 500) {
          return "Lỗi hệ thống máy chủ. Vui lòng thử lại sau!";
        }
      }

      if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.sendTimeout ||
          e.type == DioExceptionType.receiveTimeout) {
        return "Kết nối máy chủ quá thời gian. Vui lòng kiểm tra lại mạng!";
      } else if (e.type == DioExceptionType.connectionError) {
        return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối Internet!";
      } else if (e.type == DioExceptionType.cancel) {
        return "Yêu cầu đã bị hủy!";
      }
    }

    final errStr = e.toString();
    if (errStr.contains("ApiException: 10") || errStr.contains("developer_error") || errStr.contains("sign_in_failed")) {
      return "Lỗi Google (Code 10): Vui lòng đăng ký mã SHA-1 của máy bạn lên Firebase Console!";
    }

    if (errStr.contains("SocketException") || errStr.contains("Failed host lookup")) {
      return "Không có kết nối Internet. Vui lòng kiểm tra mạng!";
    }

    return "Đã xảy ra lỗi. Vui lòng thử lại!";
  }

  Future<bool> login(String email, String password) async {
    try {
      isLoading = true;
      error = null;
      requireOtp = false;
      unverifiedEmail = null;
      notifyListeners();

      final result = await authRepository.login(
        LoginRequest(email: email, password: password),
      );

      final accessToken = result.accessToken;
      final refreshToken = result.refreshToken;

      if (accessToken.isNotEmpty && refreshToken.isNotEmpty) {
        // 1. Lưu token mới vào máy
        await storageService.saveToken(
          accessToken,
          refreshToken,
        );

        // Cần gọi để setup session
        await appSession.init();

        // 2. Không gọi hàm gán quyền gì ở đây cả, trả về true luôn
        return true;
      }

      return false;
    } catch (e) {
      if (e is DioException && e.response?.data != null) {
        final resData = e.response!.data;
        if (resData is Map<String, dynamic>) {
          if (resData['requireOtp'] == true) {
            requireOtp = true;
            unverifiedEmail = resData['email']?.toString() ?? email;
            error = resData['message']?.toString() ?? "Tài khoản chưa xác thực Email. Vui lòng nhập mã OTP!";
            return false;
          }
          if (resData['isBanned'] == true) {
            final reason = resData['banReason']?.toString() ?? 'Không có lý do';
            error = 'Tài khoản của bạn đã bị khóa!\nLý do: $reason';
            return false;
          }
        }
      }
      error = _parseError(e);
      return false;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> guestLogin(String phone, String fullName) async {
    try {
      isLoading = true;
      error = null;
      notifyListeners();

      final result = await authRepository.guestLogin(
        phone: phone,
        fullName: fullName,
      );

      final accessToken = result.accessToken;
      final refreshToken = result.refreshToken;

      if (accessToken.isNotEmpty && refreshToken.isNotEmpty) {
        await storageService.saveToken(accessToken, refreshToken);
        await appSession.init();
        return true;
      }

      return false;
    } catch (e) {
      error = _parseError(e);
      return false;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    try {
      isLoading = true;
      notifyListeners();

      // 1. Gọi API logout trên server
      try {
        await authRepository.logout();
      } catch (e) {
        debugPrint("⚠️ Lỗi gọi API logout server: $e");
      }

      // 2. Đăng xuất Google SDK (nếu có)
      try {
        final GoogleSignIn googleSignIn = GoogleSignIn();
        if (await googleSignIn.isSignedIn()) {
          await googleSignIn.signOut();
        }
      } catch (e) {
        debugPrint("⚠️ Lỗi signOut Google SDK: $e");
      }

      // 3. Xóa toàn bộ Token (Access & Refresh), hủy định vị GPS, ngắt Socket và reset Session
      await appSession.logout();

      // 4. Clear hết biến lỗi và OTP state trong AuthProvider
      clearError();
    } catch (e) {
      debugPrint("🚨 Lỗi trong quá trình đăng xuất: $e");
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> register(
    String email,
    String password,
    String confirmPassword,
  ) async {
    try {
      isLoading = true;
      error = null;
      notifyListeners();

      final request = RegisterRequest(
        email: email,
        password: password,
        confirmPassword: confirmPassword,
        providerId: email,
      );

      await authRepository.register(request);
      return true;
    } catch (e) {
      error = _parseError(e);
      return false;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> verifyOtp(String email, String otpCode) async {
    try {
      isLoading = true;
      error = null;
      notifyListeners();

      final result = await authRepository.verifyOtp(
        email: email,
        otpCode: otpCode,
      );

      final accessToken = result.accessToken;
      final refreshToken = result.refreshToken;

      if (accessToken.isNotEmpty && refreshToken.isNotEmpty) {
        // Tự động lưu Token và đăng nhập vào thẳng ứng dụng
        await storageService.saveToken(accessToken, refreshToken);
        await appSession.init();
        return true;
      }

      return false;
    } catch (e) {
      error = _parseError(e);
      return false;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> forgotPassword(String email) async {
    try {
      isLoading = true;
      error = null;
      notifyListeners();

      await authRepository.forgotPassword(email: email);
      return true;
    } catch (e) {
      error = _parseError(e);
      return false;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> resetPassword({
    required String email,
    required String otpCode,
    required String newPassword,
    required String confirmPassword,
  }) async {
    try {
      isLoading = true;
      error = null;
      notifyListeners();

      await authRepository.resetPassword(
        email: email,
        otpCode: otpCode,
        newPassword: newPassword,
        confirmPassword: confirmPassword,
      );
      return true;
    } catch (e) {
      error = _parseError(e);
      return false;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> resendOtp(String email) async {
    try {
      isLoading = true;
      error = null;
      notifyListeners();

      await authRepository.resendOtp(email: email);
      return true;
    } catch (e) {
      error = _parseError(e);
      return false;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> loginWithGoogle() async {
    try {
      isLoading = true;
      error = null;
      notifyListeners();

      final GoogleSignIn googleSignIn = GoogleSignIn(
        serverClientId: '221191601744-g2ricfelugaj1iu5calpprlm7t6frm04.apps.googleusercontent.com',
        scopes: ['email', 'profile'],
      );

      await googleSignIn.signOut();

      final GoogleSignInAccount? googleAccount = await googleSignIn.signIn();

      if (googleAccount == null) {
        isLoading = false;
        notifyListeners();
        return false;
      }

      final String email = googleAccount.email;
      final String providerId = googleAccount.id;
      final String? fullName = googleAccount.displayName;
      final String? avatarUrl = googleAccount.photoUrl;

      // Trích xuất ID Token đã được Google mã hóa xác thực
      final GoogleSignInAuthentication googleAuth = await googleAccount.authentication;
      final String? idToken = googleAuth.idToken;

      final result = await authRepository.loginWithGoogle(
        email: email,
        providerId: providerId,
        fullName: fullName,
        avatarUrl: avatarUrl,
        idToken: idToken,
      );

      final accessToken = result.accessToken;
      final refreshToken = result.refreshToken;

      if (accessToken.isNotEmpty && refreshToken.isNotEmpty) {
        await storageService.saveToken(accessToken, refreshToken);
        await appSession.init();
        return true;
      }

      return false;
    } catch (e) {
      debugPrint("🚨 [Google Sign-In Error]: $e");
      if (e is DioException && e.response?.data != null) {
        final resData = e.response!.data;
        if (resData is Map<String, dynamic> && resData['isBanned'] == true) {
          final reason = resData['banReason']?.toString() ?? 'Không có lý do';
          error = 'Tài khoản của bạn đã bị khóa!\nLý do: $reason';
          return false;
        }
      }
      error = _parseError(e);
      return false;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }
}
