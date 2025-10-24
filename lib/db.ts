import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT || 3306),
      connectionLimit: 10,
      // simpan di DB UTC; ambil sebagai UTC
      timezone: "Z",
      dateStrings: true, // kirim DATETIME sebagai string agar presisi
    });
  }
  return pool;
}
