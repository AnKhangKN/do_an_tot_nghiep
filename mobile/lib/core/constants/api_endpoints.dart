/// Hằng số đường dẫn các API Endpoint của hệ thống Backend
class ApiEndpoints {
  // Auth (Xác thực)
  static const String login = '/api/auth/login';
  static const String register = '/api/auth/register';
  static const String refreshToken = '/api/auth/refresh-token';
  static const String me = '/api/auth/me';
  static const String deviceTokens = '/api/device_tokens';

  // SOS & Cứu hộ
  static const String sosRequests = '/api/sos/sos_requests';
  static const String cancelSos = '/api/sos/sos_requests/cancel';
  static const String activeSos = '/api/sos/sos_requests/active';
  static const String sosHistory = '/api/sos/sos_requests/history';
  static const String acceptQrSos = '/api/sos/sos_requests/accept-qr';

  // Tiện ích cộng đồng (Emergency Amenities)
  static const String amenityCategories = '/api/emergency-amenities/categories';
  static const String approvedAmenities = '/api/emergency-amenities/approved';
  static const String emergencyAmenities = '/api/emergency-amenities';
  static const String myAmenities = '/api/emergency-amenities/my';

  // Đội cứu hộ (Rescuer)
  static const String registerRescuer = '/api/rescuer/register';

  // Nhắn tin (Chat)
  static const String chatConversations = '/api/chat/conversations';
  static const String chatMessages = '/api/chat/messages';

  // Thông báo (Notifications)
  static const String notifications = '/api/notifications';
  static const String notificationsReadAll = '/api/notifications/read-all';

  // Đánh giá (Ratings)
  static const String ratings = '/api/ratings';

  // Loại sự cố & Điểm nguy hiểm
  static const String incidentTypes = '/api/incident_types';
  static const String dangerousPoints = '/api/dangerous_points';
  static const String dangerousPointsApproved = '/api/dangerous_points/approved';
  static const String myDangerousPoints = '/api/dangerous_points/my';

  // Báo cáo ứng dụng (App Feedback)
  static const String appFeedbacks = '/api/app-feedbacks';
  static const String myAppFeedbacks = '/api/app-feedbacks/my';
}
