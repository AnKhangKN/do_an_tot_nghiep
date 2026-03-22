const notificationModel = require("./notification.model");
const { pool } = require("@/config/database");

class NotificationEntity {
  constructor() {
    this.model = notificationModel;
  }

  getNotifications = async () => {
    const query = `SELECT * FROM ${this.model.table}`;
    const result = await pool.query(query);
    return result.rows;
  };
}

module.exports = new NotificationEntity();
