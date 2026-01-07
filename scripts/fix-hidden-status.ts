import { config } from "dotenv";
config({ path: ".env.local" });
import { db, contents } from "../src/lib/db";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Updating hidden content to active...");

    const result = await db
        .update(contents)
        .set({ status: "active" })
        .where(eq(contents.status, "hidden"));

    console.log("Done! Updated hidden items to active.");
    process.exit(0);
}

main().catch(console.error);
