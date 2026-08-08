import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../core/constants/color_constants.dart';
import '../../../../core/di/di.dart';
import '../../../../core/utils/formatters.dart';
import '../providers/notification_provider.dart';
import '../widgets/notification_card.dart';

class NotificationScreen extends StatefulWidget {
  const NotificationScreen({super.key});

  @override
  State<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      getIt<NotificationProvider>().fetchNotifications();
    });
  }

  String _mapType(String rawType) {
    switch (rawType.toUpperCase()) {
      case 'EMERGENCY':
      case 'SOS_ALERT':
      case 'SOS':
        return 'emergency';
      case 'WARNING':
        return 'warning';
      case 'SUCCESS':
        return 'success';
      case 'INFO':
      case 'MOVING':
        return 'moving';
      case 'SYSTEM':
      default:
        return 'system';
    }
  }

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
      value: getIt<NotificationProvider>(),
      child: Scaffold(
        backgroundColor: ColorConstants.backgroundLight,
        appBar: AppBar(
          backgroundColor: ColorConstants.surfaceWhite,
          elevation: 0,
          centerTitle: true,
          title: const Text(
            "THÔNG BÁO HỆ THỐNG",
            style: TextStyle(
              color: ColorConstants.redRescue,
              fontWeight: FontWeight.w900,
              letterSpacing: 1.1,
            ),
          ),
          actions: [
            Consumer<NotificationProvider>(
              builder: (context, provider, _) {
                return IconButton(
                  onPressed: () => provider.markAllAsRead(),
                  icon: const Icon(Icons.done_all, color: ColorConstants.redRescue),
                  tooltip: "Đánh dấu đã đọc tất cả",
                );
              },
            ),
          ],
        ),
        body: SafeArea(
          child: Consumer<NotificationProvider>(
            builder: (context, provider, _) {
              if (provider.isLoading && provider.notifications.isEmpty) {
                return const Center(child: CircularProgressIndicator());
              }

              final notifications = provider.notifications;
              final unreadCount = provider.unreadCount;

              return RefreshIndicator(
                onRefresh: () => provider.fetchNotifications(),
                child: Column(
                  children: [
                    // Header Summary Row
                    Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            "Gần đây",
                            style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: unreadCount > 0
                                  ? ColorConstants.redRescue.withOpacity(0.1)
                                  : ColorConstants.border,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              unreadCount > 0
                                  ? "$unreadCount Thông báo mới"
                                  : "Không có thông báo chưa đọc",
                              style: TextStyle(
                                color: unreadCount > 0
                                    ? ColorConstants.redRescue
                                    : ColorConstants.textSecondary,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 8),

                    // Notification list
                    Expanded(
                      child: notifications.isEmpty
                          ? ListView(
                              children: [
                                const SizedBox(height: 100),
                                Center(
                                  child: Text(
                                    "Chưa có thông báo nào từ hệ thống.",
                                    style: TextStyle(color: ColorConstants.textSecondary),
                                  ),
                                ),
                              ],
                            )
                          : ListView.builder(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              itemCount: notifications.length,
                              itemBuilder: (context, index) {
                                final item = notifications[index];
                                return NotificationCard(
                                  title: item.title,
                                  message: item.content,
                                  time: Formatters.formatDateTime(item.createdAt),
                                  type: _mapType(item.type),
                                  isRead: item.isRead,
                                );
                              },
                            ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}
