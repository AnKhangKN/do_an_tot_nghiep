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

    // ---------------------------------------

    // Tự động tạo bảng rescuer_histories nếu chưa tồn tại
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS rescuer_histories (
          rescuer_history_id UUID PRIMARY KEY,
          rescuer_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
          sos_request_id UUID NOT NULL REFERENCES sos_requests(sos_request_id) ON DELETE CASCADE,
          action VARCHAR(50) NOT NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_rescuer_histories_rescuer_id ON rescuer_histories(rescuer_id);
      CREATE INDEX IF NOT EXISTS idx_rescuer_histories_sos_request_id ON rescuer_histories(sos_request_id);
    `;
    await client.query(createTableQuery);
    console.log("Database table 'rescuer_histories' verified/created successfully.");

    // ---------------------------------------

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
