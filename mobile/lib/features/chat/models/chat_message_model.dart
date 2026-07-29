class ChatMessageModel {
  final String id;
  final String senderId;
  final String text;
  final String time;
  final bool isMe;
  final bool isEmergency;
  final bool isFailed;
  final String? errorMessage;

  const ChatMessageModel({
    required this.id,
    required this.senderId,
    required this.text,
    required this.time,
    required this.isMe,
    this.isEmergency = false,
    this.isFailed = false,
    this.errorMessage,
  });

  ChatMessageModel copyWith({
    String? id,
    String? senderId,
    String? text,
    String? time,
    bool? isMe,
    bool? isEmergency,
    bool? isFailed,
    String? errorMessage,
  }) {
    return ChatMessageModel(
      id: id ?? this.id,
      senderId: senderId ?? this.senderId,
      text: text ?? this.text,
      time: time ?? this.time,
      isMe: isMe ?? this.isMe,
      isEmergency: isEmergency ?? this.isEmergency,
      isFailed: isFailed ?? this.isFailed,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}
