require("module-alias/register");
const { pool } = require("./config/database.config");

async function check() {
    try {
        const res = await pool.query("SELECT * FROM incident_types");
        console.log("DỮ LIỆU incident_types TRONG DB:", res.rows);
    } catch (err) {
        console.error("LỖI KHI QUERY DB:", err);
    } finally {
        await pool.end();
    }
}

check();
