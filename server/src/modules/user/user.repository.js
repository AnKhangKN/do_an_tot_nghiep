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
                    INSERT INTO ${this.user.table} (${this.user.field.userId}, ${this.user.field.fullName}, ${this.user.field.email})
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
}

module.exports = new UserRepository();