require("module-alias/register");
const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
require("dotenv").config({ path: envFile });
const bcrypt = require("bcrypt");
const { generateUUID } = require("@/utils/uuid.util");
const { pool } = require("../src/config/database.config");

/**
 * KỊCH BẢN TẠO / CẬP NHẬT TÀI KHOẢN ADMIN
 *
 * Cách chạy:
 *   - Dev (local):        node scripts/seed_admin.js
 *   - Production (Render): NODE_ENV=production node scripts/seed_admin.js
 *
 * Hoạt động kiểu "upsert" (idempotent):
 *   - Chưa có account -> tạo mới user (role ADMIN) + user_auth (password)
 *   - Đã có account     -> nâng role ADMIN, bật is_verified, ACTIVE, đặt lại mật khẩu
 */
const ADMIN_EMAIL = "[EMAIL_ADDRESS]";
const ADMIN_PASSWORD = "111111";
const ADMIN_FULL_NAME = "admin";

async function seedAdmin() {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        let user = await client.query(
            "SELECT user_id, role, status FROM users WHERE email = $1",
            [ADMIN_EMAIL]
        );

        if (user.rows.length === 0) {
            const userId = generateUUID();
            const created = await client.query(
                `INSERT INTO users (user_id, full_name, email, role, is_verified, status)
                 VALUES ($1, $2, $3, 'ADMIN', true, 'ACTIVE')
                 RETURNING user_id, email, role, status, is_verified`,
                [userId, ADMIN_FULL_NAME, ADMIN_EMAIL]
            );
            user = created;
            console.log("✔ Đã TẠO MỚI account admin:", JSON.stringify(user.rows[0]));
        } else {
            const updated = await client.query(
                `UPDATE users SET role = 'ADMIN', is_verified = true, status = 'ACTIVE'
                 WHERE email = $1
                 RETURNING user_id, email, role, status, is_verified`,
                [ADMIN_EMAIL]
            );
            user = updated;
            console.log("✔ Đã CẬP NHẬT account admin:", JSON.stringify(user.rows[0]));
        }

        const userId = user.rows[0].user_id;

        const existingAuth = await client.query(
            "SELECT user_auth_id FROM user_auth WHERE user_id = $1",
            [userId]
        );

        if (existingAuth.rows.length === 0) {
            await client.query(
                `INSERT INTO user_auth (user_auth_id, user_id, provider, provider_id, password)
                 VALUES ($1, $2, 'EMAIL', $3, $4)`,
                [generateUUID(), userId, ADMIN_EMAIL, passwordHash]
            );
            console.log("✔ Đã TẠO bản ghi user_auth (EMAIL).");
        } else {
            await client.query(
                "UPDATE user_auth SET provider = 'EMAIL', provider_id = $1, password = $2 WHERE user_id = $3",
                [ADMIN_EMAIL, passwordHash, userId]
            );
            console.log("✔ Đã CẬP NHẬT mật khẩu trong user_auth.");
        }

        await client.query("COMMIT");
        console.log("✔ Hoàn tất. Đăng nhập bằng:", ADMIN_EMAIL, "/", ADMIN_PASSWORD);
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("✘ Lỗi khi chạy script:", error.message);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
}

seedAdmin();
