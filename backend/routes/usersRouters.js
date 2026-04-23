import express from "express";
import * as users from "../controllers/usersController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

/* =====================================================
   MY PROFILE
===================================================== */

router.get("/me", authMiddleware, users.getMe);
router.patch("/me", authMiddleware, users.updateMe);
router.patch("/me/password", authMiddleware, users.changeMyPassword);
router.post(
  "/me/avatar",
  authMiddleware,
  upload.single("file"),
  users.updateAvatar,
);

/* =====================================================
   AUTH REQUIRED ROUTES
===================================================== */

router.patch(
  "/avatar",
  authMiddleware,
  upload.single("avatar"),
  users.updateAvatar,
);

router.get("/notify/:userId", authMiddleware, users.getUserNotifications);

/* =====================================================
   USER CRUD
===================================================== */

router.get("/", authMiddleware, users.getAllUsers);
router.get("/:id", authMiddleware, users.getUserById);

router.post("/", authMiddleware, adminOnly, users.createUser);
router.patch("/:id", authMiddleware, adminOnly, users.updateUserById);
router.delete("/:id", authMiddleware, adminOnly, users.deleteUser);

export default router;
