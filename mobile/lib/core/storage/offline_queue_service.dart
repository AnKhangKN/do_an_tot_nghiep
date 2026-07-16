import 'package:hive_flutter/hive_flutter.dart';
import 'package:uuid/uuid.dart';

class OfflineQueueService {
  static const String _boxName = 'offline_tasks';
  static final OfflineQueueService _instance = OfflineQueueService._internal();

  factory OfflineQueueService() => _instance;
  OfflineQueueService._internal();

  Box? _box;

  Future<void> init() async {
    try {
      await Hive.initFlutter();
    } catch (_) {
      // Bỏ qua nếu Hive đã được khởi tạo trước đó ở Isolate khác
    }
    _box = await Hive.openBox(_boxName);
    print("[OFFLINE QUEUE] Khởi tạo thành công database local Hive.");
  }

  Future<Box> _getBox() async {
    if (_box == null || !_box!.isOpen) {
      await init();
    }
    return _box!;
  }

  // Đẩy tác vụ chưa gửi vào hàng đợi local
  Future<void> queueTask(String type, Map<String, dynamic> data) async {
    final box = await _getBox();
    final String taskId = const Uuid().v4();
    final task = {
      'id': taskId,
      'type': type,
      'data': data,
      'createdAt': DateTime.now().toIso8601String(),
    };

    await box.put(taskId, task);
    print("[OFFLINE QUEUE] Đã xếp hàng tác vụ ngoại tuyến ($type): $taskId");
  }

  // Lấy danh sách tác vụ đang chờ
  Future<List<Map<String, dynamic>>> getPendingTasks() async {
    final box = await _getBox();
    return box.values
        .map((e) => Map<String, dynamic>.from(e as Map))
        .toList();
  }

  // Xóa tác vụ sau khi đồng bộ thành công
  Future<void> removeTask(String taskId) async {
    final box = await _getBox();
    await box.delete(taskId);
    print("[OFFLINE QUEUE] Đã xóa tác vụ đã đồng bộ thành công: $taskId");
  }

  // Xóa toàn bộ hàng đợi
  Future<void> clearAll() async {
    final box = await _getBox();
    await box.clear();
  }
}
