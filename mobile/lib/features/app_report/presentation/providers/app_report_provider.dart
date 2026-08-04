import 'package:flutter/material.dart';
import '../../../../core/app_feedback/data/app_feedback_repository.dart';
import '../../../../core/app_feedback/models/app_feedback_model.dart';
import '../../../../core/di/di.dart';

/// Provider quản lý state cho tính năng Báo cáo ứng dụng
class AppReportProvider extends ChangeNotifier {
  final AppFeedbackRepository _repository = getIt<AppFeedbackRepository>();

  // State gửi báo cáo
  bool _isSubmitting = false;
  String? _submitError;
  bool _submitSuccess = false;

  // State lịch sử báo cáo
  List<AppFeedbackModel> _reports = [];
  bool _isLoading = false;
  bool _hasLoaded = false;
  int _totalPages = 1;
  int _page = 1;
  String? _loadError;

  bool get isSubmitting => _isSubmitting;
  String? get submitError => _submitError;
  bool get submitSuccess => _submitSuccess;

  List<AppFeedbackModel> get reports => _reports;
  bool get isLoading => _isLoading;
  bool get hasLoaded => _hasLoaded;
  int get totalPages => _totalPages;
  int get page => _page;
  String? get loadError => _loadError;

  /// Gửi báo cáo ứng dụng. Trả về true nếu thành công.
  Future<bool> submitReport({
    required String category,
    required String title,
    required String content,
  }) async {
    _isSubmitting = true;
    _submitError = null;
    _submitSuccess = false;
    notifyListeners();

    try {
      await _repository.submitReport(
        category: category,
        title: title,
        content: content,
      );
      _submitSuccess = true;
      return true;
    } catch (e) {
      _submitError = 'Gửi báo cáo thất bại. Vui lòng thử lại sau!';
      return false;
    } finally {
      _isSubmitting = false;
      notifyListeners();
    }
  }

  /// Reset trạng thái sau khi gửi (ví dụ: sau khi đã hiển thị thông báo thành công)
  void resetSubmitState() {
    _submitSuccess = false;
    _submitError = null;
    notifyListeners();
  }

  /// Tải lịch sử báo cáo (page đầu tiên)
  Future<void> fetchMyReports() async {
    _isLoading = true;
    _loadError = null;
    notifyListeners();

    try {
      final result = await _repository.getMyReports(page: 1, limit: 20);
      _reports = result.data;
      _totalPages = result.totalPages;
      _page = 1;
      _hasLoaded = true;
    } catch (e) {
      _loadError = 'Không thể tải lịch sử báo cáo. Vui lòng thử lại!';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Tải thêm trang tiếp theo (nếu còn)
  Future<void> loadMore() async {
    if (_isLoading || _page >= _totalPages) return;

    _isLoading = true;
    notifyListeners();
    try {
      final next = _page + 1;
      final result = await _repository.getMyReports(page: next, limit: 20);
      _reports = [..._reports, ...result.data];
      _totalPages = result.totalPages;
      _page = next;
    } catch (e) {
      _loadError = 'Không thể tải thêm lịch sử báo cáo.';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Reset state khi đăng xuất
  void reset() {
    _reports = [];
    _hasLoaded = false;
    _isLoading = false;
    _isSubmitting = false;
    _submitError = null;
    _submitSuccess = false;
    _loadError = null;
    _page = 1;
    _totalPages = 1;
    notifyListeners();
  }
}
