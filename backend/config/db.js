const postgres = require("postgres");
require("dotenv").config();

const sql = postgres(process.env.DATABASE_URL, {
  ssl: "require", // مهم لو كنتِ على Supabase
});

async function testConnection() {
  try {
    const result = await sql`SELECT NOW() AS now`;
    console.log("✅ Connected to PostgreSQL at:", result[0].now);
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
  }
}
testConnection();

module.exports = sql;
