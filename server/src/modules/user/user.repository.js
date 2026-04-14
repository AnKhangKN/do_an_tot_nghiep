const userModel = require("./user.model");
const userAuthModel = require("../user_auth/user_auth.model");
const { pool } = require("@config/database.config");

class UserRepository {
    constructor() {
        this.user = userModel;
        this.userAuth = userAuthModel;
    }

    // check user có tồn tại không
    exists = async (client, {email}) => {
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

    getUserIdByEmail = async (client, { email }) => {
        const query = `
        SELECT 
            ${this.user.field.userId}
        FROM ${this.user.table}
        WHERE ${this.user.field.email} = $1
        `;

        const result = await client.query(query, [email]);
        return result.rows[0] ? result.rows[0] : null;
    }

    getUserInfoById = async ( { userId }) => {
        const query = `
        SELECT 
            ${this.user.field.userId},  
            ${this.user.field.fullName}, 
            ${this.user.field.email}, 
            ${this.user.field.phone}, 
            ${this.user.field.role}, 
            ${this.user.field.status}, 
            ${this.user.field.avatarUrl}, 
            ${this.user.field.isVerified}
        FROM ${this.user.table}
        WHERE ${this.user.field.userId} = $1
        `;  

        const result = await pool.query(query, [userId]);
        return result.rows[0] ? result.rows[0] : null;
    }
}

module.exports = new UserRepository();