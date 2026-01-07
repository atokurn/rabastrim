import { db, contents } from "../src/lib/db";

async function main() {
    try {
        console.log("Testing DB connection...");
        const result = await db.select().from(contents).limit(1);
        console.log("DB Query success. Result:", result);
    } catch (e) {
        console.error("DB Error:", e);
    }
}

main();
