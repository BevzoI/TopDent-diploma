import mongoose from "mongoose";
import { MONGO_USERNAME, MONGO_PASSWORD, MONGO_CLUSTER, MONGO_DB, APP_NAME } from './config.js';

const MONGODB_URI = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_CLUSTER}/${MONGO_DB}?retryWrites=true&w=majority`;

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export default async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    }).then((mongoose) => {
      console.log(`✅ MongoDB Connected (${APP_NAME})`);
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}