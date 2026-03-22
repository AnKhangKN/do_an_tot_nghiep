const notificationService = require("@modules/notification/notification.service");

class NotificationController {
  constructor() {
    this.service = notificationService;
  }

  getNotification = async (req, res, next) => {
    try {
      const data = await this.service.getNotification();
      res.json(data);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new NotificationController();
