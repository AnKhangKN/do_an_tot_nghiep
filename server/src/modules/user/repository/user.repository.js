const userModel = require("../model/user.model");
const userAuthModel = require("../../user_auth/model/user_auth.model");
const { pool } = require("@config/database.config");

class UserRepository {
    constructor() {
        this.user = userModel;
        this.userAuth = userAuthModel;
    }

    // check user có tồn tại không
    exists = async (client, { email }) => {
        const query = `
        SELECT 1 
        FROM ${this.user.table} 
        WHERE ${this.user.field.email} = $1 
        LIMIT 1
        `;

        const result = await client.query(query, [email]);
        return result.rows.length > 0;
    };

    createUser = async (client, { userId, fullName, email }) => {
        const query = `
        INSERT INTO ${this.user.table} 
            (${this.user.field.userId}, 
            ${this.user.field.fullName}, 
            ${this.user.field.email})
        VALUES ($1, $2, $3)
        RETURNING *
        `;

        const result = await client.query(query, [
            userId,
            fullName,
            email,
        ]);

        return result.rows[0];
    };

    getUserAuthInfo = async (client, { userId }) => {
        const query = `
        SELECT 
            ${this.user.field.userId},
            ${this.user.field.phone},
            ${this.user.field.role},
            ${this.user.field.isVerified},
            ${this.user.field.status}

        FROM  ${this.user.table}
        WHERE ${this.user.field.userId} = $1
        `;

        const result = await client.query(query, [userId]);
        return result.rows[0] ? result.rows[0] : null;
    }

    getUserIdByEmail = async (client, { email }) => {
        const query = `
        SELECT 
            ${this.user.field.userId},
            ${this.user.field.role}
        FROM ${this.user.table}
        WHERE ${this.user.field.email} = $1
        `;

        const result = await client.query(query, [email]);
        return result.rows[0] ? result.rows[0] : null;
    }

    getUserInfoById = async ({ userId }) => {
        const query = `
        SELECT 
            ${this.user.field.userId},  
            ${this.user.field.fullName}, 
            ${this.user.field.email}, 
            ${this.user.field.phone}, 
            ${this.user.field.role}, 
            ${this.user.field.status}, 
            ${this.user.field.avatarUrl}
        FROM ${this.user.table}
        WHERE ${this.user.field.userId} = $1
        `;

        const result = await pool.query(query, [userId]);
        return result.rows[0] ? result.rows[0] : null;
    }

    updatePhone = async (client, { userId, phone }) => {
        const query = `
        UPDATE ${this.user.table}
        SET ${this.user.field.phone} = $2
        WHERE ${this.user.field.userId} = $1
        RETURNING *
    `;

        const result = await client.query(query, [userId, phone]);
        return result.rows[0];
    }

    updateRole = async (client, { userId, role }) => {
        const query = `
        UPDATE ${this.user.table}
        SET ${this.user.field.role} = $2
        WHERE ${this.user.field.userId} = $1
        RETURNING *
        `;

        const result = await client.query(query, [userId, role]);
        return result.rows[0];
    }

    getUsersAdmin = async ({ page, limit }) => {
        const offset = (page - 1) * limit;

        const query = `
        SELECT 
            ${this.user.field.userId},
            ${this.user.field.fullName},
            ${this.user.field.email},
            ${this.user.field.phone},
            ${this.user.field.role},
            ${this.user.field.status},
            ${this.user.field.avatarUrl},
            ${this.user.field.createdAt},
            ${this.user.field.updatedAt}
        FROM ${this.user.table}
        ORDER BY ${this.user.field.createdAt} DESC
        LIMIT $1 OFFSET $2
        `;

        const countQuery = `
        SELECT COUNT(*) AS total
        FROM ${this.user.table}
        `;

        const [dataResult, countResult] = await Promise.all([
            pool.query(query, [limit, offset]),
            pool.query(countQuery)
        ]);

        const total = parseInt(countResult.rows[0].total, 10);

        return {
            data: dataResult.rows,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }
}

module.exports = new UserRepository();