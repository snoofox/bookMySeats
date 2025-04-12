import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on("connect", () => {
    console.log("[LOG] Connected to the pg database");
});

pool.on("error", (err) => {
    console.error("[ERROR] Unexpected error on idle client", err);
    process.exit(-1);
});

export default pool;

