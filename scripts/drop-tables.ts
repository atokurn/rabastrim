import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function dropTables() {
    console.log("Dropping existing tables...");

    // Drop tables in correct order (respecting foreign keys)
    await sql`DROP TABLE IF EXISTS watch_history CASCADE`;
    await sql`DROP TABLE IF EXISTS favorites CASCADE`;
    await sql`DROP TABLE IF EXISTS drama_cache CASCADE`;
    await sql`DROP TABLE IF EXISTS episode_cache CASCADE`;
    await sql`DROP TABLE IF EXISTS users CASCADE`;

    console.log("✓ All tables dropped successfully");
}

dropTables().catch(console.error);
