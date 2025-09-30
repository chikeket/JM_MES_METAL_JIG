// server/database/mapper.js
const mariadb = require("mariadb");
const path = require("path");
const dotenv = require("dotenv");

// .env 로드 (configs/dbConfig.env)
dotenv.config({ path: path.resolve(__dirname, "configs", "dbConfig.env") });

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectionLimit: 10,
  multipleStatements: false,
});

// 공통 쿼리 실행기
async function query(sql, params = []) {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(sql, params);
    // mariadb 드라이버는 rows에 meta가 섞여오지 않음 (mysql2와 다름)
    return rows;
  } catch (err) {
    // 로깅 후 throw
    console.error("[DB-ERROR]", err.message);
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

module.exports = {
  query,
};
