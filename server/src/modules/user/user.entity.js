const userModel = require("./user.model");
const userAuthModel = require("./user_auth.model");
const { pool } = require("@config/database.config");

class UserEntity {
    constructor() {
        this.user = userModel;
        this.userAuth = userAuthModel;
    }

    // check user có tồn tại không
    exists = async (email) => {
        const query = `
            SELECT 1 
            FROM ${this.user.table} 
            WHERE ${this.user.field.email} = $1 
            LIMIT 1
        `;

        const result = await pool.query(query, [email]);

        return result.rows.length > 0;
    };

    createUser = async ({
        userId,
        fullName,
        email,
        userAuthId,
        provider,
        providerId,
        password,
    }) => {
        const client = await pool.connect(); // Tạo connect mới để dùng transaction

        try {
            await client.query("BEGIN");

            // 1. Insert users
            const insertUserQuery = `
                INSERT INTO ${this.user.table}
                (${this.user.field.userId}, ${this.user.field.fullName}, ${this.user.field.email})
                VALUES ($1, $2, $3)
                RETURNING *
            `;

            const userResult = await client.query(insertUserQuery, [
                userId,
                fullName,
                email,
            ]);

            // 2. Insert user_auth
            const insertUserAuthQuery = `
                INSERT INTO ${this.userAuth.table}
                (${this.userAuth.field.userAuthId}, ${this.userAuth.field.userId}, ${this.userAuth.field.provider}, 
                 ${this.userAuth.field.providerId}, ${this.userAuth.field.password})
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `;

            const userAuthResult = await client.query(insertUserAuthQuery, [
                userAuthId,
                userId,
                provider,
                providerId,
                password,
            ]);

            await client.query("COMMIT");

            return {
                user: userResult.rows[0],
                userAuth: userAuthResult.rows[0],
            };
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    };
}

module.exports = new UserEntity();