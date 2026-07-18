const { pool } = require('@/config/database.config');
const notificationModel = require('../model/notification.model');

class NotificationRepository {
    constructor() {
        this.notificationModel = notificationModel;
    }

    createNotification = async (client, { notificationId, userId, title, content, type }) => {
        const query = `
            INSERT INTO ${this.notificationModel.table} (
                ${this.notificationModel.field.notificationId},
                ${this.notificationModel.field.userId},
                ${this.notificationModel.field.title},
                ${this.notificationModel.field.content},
                ${this.notificationModel.field.type}
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const result = await client.query(query, [
            notificationId,
            userId,
            title,
            content,
            type
        ]);
        return result.rows[0];
    }
}

module.exports = new NotificationRepository();