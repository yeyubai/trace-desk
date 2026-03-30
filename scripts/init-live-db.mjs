#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import pg from "pg";

const envLocalPath = path.resolve(".env.local");

if (fs.existsSync(envLocalPath)) {
  const envLines = fs.readFileSync(envLocalPath, "utf8").split(/\r?\n/);

  for (const line of envLines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is required to initialize the live database.");
  process.exit(1);
}

const sqlPath = path.resolve("src", "services", "db", "sql", "001_init.sql");

if (!fs.existsSync(sqlPath)) {
  console.error(`SQL file not found: ${sqlPath}`);
  process.exit(1);
}

const sql = fs.readFileSync(sqlPath, "utf8");
const pool = new pg.Pool({
  connectionString: databaseUrl,
});

try {
  await pool.query(sql);
  console.log("Live database initialized.");
} finally {
  await pool.end();
}
