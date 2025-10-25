import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";

const __dirname = process.cwd();

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || "root";
const DB_PASS = process.env.DB_PASS || "";
const DB_NAME = process.env.DB_NAME || "ecampus";

async function importSQL() {
  const conn = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    multipleStatements: true,
  });

  const dir = path.join(__dirname, "db");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql"));

  for (const f of files) {
    const filePath = path.join(dir, f);
    const sql = fs.readFileSync(filePath, "utf8");
    console.log(`🟦 Importing ${f} ...`);
    try {
      await conn.query(sql);
      console.log(`✅  ${f} imported.`);
    } catch (err) {
      console.error(`❌  Failed ${f}:`, err.message);
    }
  }

  await conn.end();
  console.log("✨ Import selesai!");
}

importSQL().catch((e) => {
  console.error(e);
  process.exit(1);
});
