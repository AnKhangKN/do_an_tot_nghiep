class RefreshTokenRequest {
  final String refreshToken; // Đổi thành refreshToken cho đúng bản chất
  final String platform;     // Sửa lại chữ "f" viết thường cho chuẩn camelCase

  RefreshTokenRequest({
    required this.refreshToken,
    required this.platform,
  });

  // Hàm để convert Object thành Map<String, dynamic> gửi lên Server
  Map<String, dynamic> toJson() {
    return {
      "data": refreshToken,
      "platform": platform,
    };
  }
}