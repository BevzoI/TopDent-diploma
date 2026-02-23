import dotenv from 'dotenv';
dotenv.config();

// Server
export const PORT = process.env.PORT;
export const APP_NAME = process.env.APP_NAME;
export const DOMAIN = process.env.DOMAIN;
export const FRONTEND_URL = process.env.FRONTEND_URL;

// DataBase
export const MONGO_USERNAME = process.env.MONGO_USERNAME;
export const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
export const MONGO_CLUSTER = process.env.MONGO_CLUSTER;
export const MONGO_DB = process.env.MONGO_DB;

// Auth
export const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";