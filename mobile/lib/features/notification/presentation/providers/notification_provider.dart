import 'package:flutter/material.dart';
import '../../../../core/di/di.dart';
import '../../data/notification_service.dart';
import '../../models/notification_model.dart';

import 'package:mobile/core/socket/core_socket.dart';

class NotificationProvider extends ChangeNotifier {
  final MobileNotificationService _notificationService = getIt<MobileNotificationService>();

  List<AppNotificationModel> _notifications = [];
  bool _isLoading = false;
  String? _errorMessage;

  NotificationProvider() {
    _initSocketListeners();
  }

  void _initSocketListeners() {
    CoreSocket().addOnConnectedHook(() {
      CoreSocket().on('notification:new', (data) {
        if (data != null && data is Map) {
          try {
            final newNotif = AppNotificationModel.fromJson(Map<String, dynamic>.from(data));
            final exists = _notifications.any((n) => n.notificationId == newNotif.notificationId);
            if (!exists) {
              _notifications.insert(0, newNotif);
              notifyListeners();
            }
          } catch (e) {
            debugPrint("Lỗi parse notification:new từ socket: $e");
          }
        }
      });
    });
  }

  List<AppNotificationModel> get notifications => _notifications;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  int get unreadCount => _notifications.where((n) => !n.isRead).length;

  Future<void> fetchNotifications() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _notificationService.getMyNotifications();
      if (response.statusCode == 200 && response.data != null) {
        final List<dynamic> dataList = response.data['data'] ?? [];
        _notifications = dataList
            .map((json) => AppNotificationModel.fromJson(json as Map<String, dynamic>))
            .toList();
      } else {
        _errorMessage = "Không thể tải danh sách thông báo từ máy chủ.";
      }
    } catch (e) {
      debugPrint("Lỗi tải danh sách thông báo: $e");
      _errorMessage = "Không thể kết nối đến máy chủ thông báo.";
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> markAllAsRead() async {
    try {
      await _notificationService.markAllAsRead();
      _notifications = _notifications.map((n) {
        return AppNotificationModel(
          notificationId: n.notificationId,
          title: n.title,
          content: n.content,
          isRead: true,
          type: n.type,
          createdAt: n.createdAt,
        );
      }).toList();
      notifyListeners();
    } catch (e) {
      debugPrint("Lỗi đánh dấu đã đọc: $e");
    }
  }

  /// Reset toàn bộ state về trạng thái ban đầu khi đăng xuất (không giữ dữ liệu tài khoản cũ).
  void reset() {
    _notifications = [];
    _isLoading = false;
    _errorMessage = null;
    notifyListeners();
  }
}
