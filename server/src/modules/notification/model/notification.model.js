const NotificationModel = {
  table: "notifications",

  field: {
    notificationId: "notification_id",
    userId: "user_id",
    title: "title",
    content: "content",
    isRead: "is_read",
    type: "type",
    createdAt: "created_at",
  },
};

module.exports = NotificationModel;
