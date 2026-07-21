class ChatMessageModel {
  final String id;
  final String senderId;
  final String text;
  final String time;
  final bool isMe;
  final bool isEmergency;

  const ChatMessageModel({
    required this.id,
    required this.senderId,
    required this.text,
    required this.time,
    required this.isMe,
    this.isEmergency = false,
  });
}
