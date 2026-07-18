const { pool } = require('@/config/database.config');
const deviceTokenModel = require('../model/device_token.model');

class DeviceTokenRepository {
    constructor() {
        this.deviceTokenModel = deviceTokenModel;
    }

    upsertToken = async (client, { deviceTokensId, userId, token, platform }) => {
        // Xóa token cũ nếu nó đang được liên kết với bất kỳ user nào khác để tránh trùng lặp
        const deleteQuery = `
            DELETE FROM ${this.deviceTokenModel.table}
            WHERE ${this.deviceTokenModel.field.token} = $1
        `;
        await client.query(deleteQuery, [token]);

        // Thêm token mới
        const insertQuery = `
            INSERT INTO ${this.deviceTokenModel.table} (
                ${this.deviceTokenModel.field.deviceTokensId},
                ${this.deviceTokenModel.field.userId},
                ${this.deviceTokenModel.field.token},
                ${this.deviceTokenModel.field.platform}
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;

        const result = await client.query(insertQuery, [deviceTokensId, userId, token, platform]);
        return result.rows[0];
    }

    getTokensByUserId = async ({ userId }) => {
        const query = `
            SELECT ${this.deviceTokenModel.field.token}
            FROM ${this.deviceTokenModel.table}
            WHERE ${this.deviceTokenModel.field.userId} = $1
        `;

        const result = await pool.query(query, [userId]);
        return result.rows;
    }

    deleteTokenByToken = async ({ token }) => {
        const query = `
            DELETE FROM ${this.deviceTokenModel.table}
            WHERE ${this.deviceTokenModel.field.token} = $1
            RETURNING *
        `;

        const result = await pool.query(query, [token]);
        return result.rows[0];
    }
}

module.exports = new DeviceTokenRepository();
