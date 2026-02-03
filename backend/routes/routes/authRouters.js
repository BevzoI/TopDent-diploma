// routes/authRouters.js
import express from "express";
import {
  login,
  setPassword,
  checkInvite,
} from "../controllers/authController.js";

const router = express.Router();

/**
 * 🔐 Login (email + password)
 * POST /auth/login
 */
router.post("/login", login);

/**
 * 🔑 Set password via invite link
 * POST /auth/set-password
 */
router.post("/set-password", setPassword);

/**
 * 🔍 Check invite token (valid / expired)
 * GET /auth/invite/:token
 */
router.get("/invite/:token", checkInvite);

export default router;
