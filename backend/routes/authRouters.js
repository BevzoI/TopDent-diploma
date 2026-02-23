import express from "express";
import { login, checkInvite, setPassword } from "../controllers/authController.js";

const router = express.Router();

// 🔐 LOGIN
router.post("/", login);

// 🔍 CHECK INVITE
router.get("/invite/:token", checkInvite);

// 🔑 SET PASSWORD
router.post("/set-password", setPassword);

export default router;