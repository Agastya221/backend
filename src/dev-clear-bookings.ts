/**
 * dev-clear-bookings.ts
 * Deletes all bookings from the database for local dev testing.
 * Run: npx ts-node src/dev-clear-bookings.ts
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI!;

async function main() {
    await mongoose.connect(MONGO_URI);
    const result = await mongoose.connection.db!.collection("bookings").deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} booking(s) from the database.`);
    await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
