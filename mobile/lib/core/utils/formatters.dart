class Formatters {
  /// Định dạng DateTime hoặc chuỗi ISO sang định dạng thân thiện: dd/MM/yyyy • HH:mm
  /// Tự động chuyển đổi sang múi giờ địa phương (local time) của thiết bị để tránh sai lệch.
  static String formatDateTime(dynamic date) {
    if (date == null) return '';
    
    DateTime? dt;
    if (date is DateTime) {
      dt = date;
    } else if (date is String) {
      dt = DateTime.tryParse(date);
    }
    
    if (dt == null) return '';
    
    // Đảm bảo chuyển sang múi giờ địa phương của thiết bị (toLocal)
    final localDt = dt.toLocal();
    
    final day = localDt.day.toString().padLeft(2, '0');
    final month = localDt.month.toString().padLeft(2, '0');
    final year = localDt.year;
    final hour = localDt.hour.toString().padLeft(2, '0');
    final minute = localDt.minute.toString().padLeft(2, '0');
    
    return "$day/$month/$year • $hour:$minute";
  }
}
