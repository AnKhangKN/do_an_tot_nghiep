class ConversationModel {
  final String id;
  final String name;
  final String lastMessage;
  final String time;
  final int unreadCount;
  final bool isEmergency;
  final bool isOnline;
  final String? avatarUrl;
  final String? phone;
  final String? partnerId;
  final bool isClosed;
  final String? sosStatus;
  final String? sosRequestId;

  const ConversationModel({
    required this.id,
    required this.name,
    required this.lastMessage,
    required this.time,
    this.unreadCount = 0,
    this.isEmergency = false,
    this.isOnline = false,
    this.avatarUrl,
    this.phone,
    this.partnerId,
    this.isClosed = false,
    this.sosStatus,
    this.sosRequestId,
  });
}
