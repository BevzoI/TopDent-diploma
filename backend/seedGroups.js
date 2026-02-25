import mongoose from "mongoose";
import dotenv from "dotenv";
import Group from "./models/Group.js";
import connectDB from "./db.js";

dotenv.config();

// 🔥 Формуємо URI так само, як у сервері
const uri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}/${process.env.MONGO_DB}?retryWrites=true&w=majority`;

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
    await mongoose.connect(uri);

    await Group.deleteMany();

    for (const name of groups) {
      await Group.create({ name });
    }

    console.log("✅ Groups seeded successfully");
    process.exit();
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

seed();