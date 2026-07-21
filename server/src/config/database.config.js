const { Pool } = require("pg");
const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
} = require("./env.config");

const pool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log("Connected to PostgreSQL");

    // Gỡ bỏ constraint unique_users_conversation để cho phép tạo nhiều conversation theo các ca SOS khác nhau
    await client.query("ALTER TABLE conversations DROP CONSTRAINT IF EXISTS unique_users_conversation;");

    client.release();
  } catch (err) {
    console.error("DB Connection Error:", err.message);
    process.exit(1);
  }
};

const transaction = async (callback) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await callback(client);

    await client.query("COMMIT");
    return result;

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Transaction error:", error.message);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  connectDB,
  pool,
  transaction
};
