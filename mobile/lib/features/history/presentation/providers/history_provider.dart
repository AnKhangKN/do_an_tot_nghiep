import 'package:flutter/material.dart';
import '../../../../core/di/di.dart';
import '../../data/history_service.dart';
import '../../models/history_model.dart';

class HistoryProvider extends ChangeNotifier {
  final HistoryService _historyService = getIt<HistoryService>();

  List<HistoryModel> _histories = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<HistoryModel> get histories => _histories;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> fetchHistory(String role) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _historyService.getHistory();
      
      if (response.statusCode == 200 && response.data != null) {
        final List<dynamic> dataList = response.data['data'] ?? [];
        _histories = dataList
            .map((json) => HistoryModel.fromJson(json as Map<String, dynamic>, role))
            .toList();
      } else {
        _errorMessage = "Không thể lấy lịch sử hỗ trợ từ máy chủ.";
      }
    } catch (e) {
      debugPrint("Lỗi tải lịch sử hỗ trợ: $e");
      _errorMessage = "Đã xảy ra lỗi kết nối. Vui lòng thử lại!";
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
