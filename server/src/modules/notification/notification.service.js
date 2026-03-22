const notificationEntity = require("./notification.entity");

class NotificationService {
  constructor() {
    this.entity = notificationEntity;
  }

  getNotification = async () => {
    const data = await this.entity.getNotifications();
    return data;
  };
}

module.exports = new NotificationService();
