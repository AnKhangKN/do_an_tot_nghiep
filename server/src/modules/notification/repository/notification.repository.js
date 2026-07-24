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
        const executor = client || pool;
        const result = await executor.query(query, [
            notificationId,
            userId,
            title,
            content,
            type || 'SYSTEM'
        ]);
        return result.rows[0];
    };

    findTargetUserIds = async ({ targetGroup }) => {
        let query = `SELECT user_id FROM users WHERE status = 'ACTIVE'`;
        const params = [];

        if (targetGroup === 'RESCUER') {
            query += ` AND role = 'RESCUER'`;
        } else if (targetGroup === 'VICTIM') {
            query += ` AND role = 'VICTIM'`;
        }

        const result = await pool.query(query, params);
        return result.rows.map(row => row.user_id);
    };

    findNotificationsByUserId = async ({ userId, limit = 30 }) => {
        const query = `
            SELECT 
                ${this.notificationModel.field.notificationId},
                ${this.notificationModel.field.title},
                ${this.notificationModel.field.content},
                ${this.notificationModel.field.isRead},
                ${this.notificationModel.field.type},
                ${this.notificationModel.field.createdAt}
            FROM ${this.notificationModel.table}
            WHERE ${this.notificationModel.field.userId} = $1
            ORDER BY ${this.notificationModel.field.createdAt} DESC
            LIMIT $2
        `;
        const result = await pool.query(query, [userId, limit]);
        return result.rows;
    };

    markAllAsRead = async ({ userId }) => {
        const query = `
            UPDATE ${this.notificationModel.table}
            SET ${this.notificationModel.field.isRead} = true
            WHERE ${this.notificationModel.field.userId} = $1
        `;
        await pool.query(query, [userId]);
    };
}

module.exports = new NotificationRepository();