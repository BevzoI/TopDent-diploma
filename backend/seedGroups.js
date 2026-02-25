import mongoose from "mongoose";
import dotenv from "dotenv";
import Group from "./models/Group.js";
import connectDB from "./db.js";

dotenv.config();

const groups = [
  "TopDent",
  "Bakov nad Jizerou",
  "Benešov",
  "Dolní Kralovice",
  "Mladá Boleslav",
  "Mnichovo Hradiště",
  "Nymburk",
  "Sedlčany",
  "Trhový Štěpánov",
  "Zruč nad Sázavou",
  "GP",
  "TopCare",
  "Lab4Dent",
  "Prádelna",
];

async function seed() {
  try {
    await connectDB();

    for (const name of groups) {
      const exists = await Group.findOne({ name });
      if (!exists) {
        await Group.create({ name });
        console.log(`✅ Created group: ${name}`);
      }
    }

    console.log("🎉 Groups seeded successfully");
    process.exit();
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
}

seed();