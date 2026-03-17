import express from "express";
import {
  login,
  checkInvite,
  setPassword,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/* =====================================================
   🔐 LOGIN
===================================================== */
router.post("/login", login);

/* =====================================================
   🔍 CHECK INVITE (for new user)
===================================================== */
router.get("/invite/:token", checkInvite);

/* =====================================================
   🔑 SET PASSWORD (first activation)
===================================================== */
router.post("/set-password", setPassword);

/* =====================================================
   🔒 CHANGE PASSWORD (logged in user)
===================================================== */
router.post(
  "/change-password",
  authMiddleware,
  changePassword
);

export default router;