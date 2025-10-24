import mysql from "mysql2/promise";
let pool: mysql.Pool | null = null;
export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "127.0.0.1",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "ecampus",
      port: Number(process.env.DB_PORT || 3306),
      connectionLimit: 10,
      timezone: "Z",
      dateStrings: true,
    });
  }
  return pool;
}
