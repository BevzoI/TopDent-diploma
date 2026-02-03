import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";

const JWT_EXPIRES_IN = "7d"; // оптимально для mobile

export function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
