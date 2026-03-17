// routes/usersRouters.js

import express from "express";
import * as users from "../controllers/usersController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

/* =====================================================
   🔐 AUTH REQUIRED ROUTES
===================================================== */

// Update avatar (Cloudinary)
router.patch(
  "/avatar",
  authMiddleware,
  upload.single("avatar"),
  users.updateAvatar
);

// Get my notifications
router.get(
  "/notify/:userId",
  authMiddleware,
  users.getUserNotifications
);

/* =====================================================
   👤 USER CRUD
===================================================== */

// List all users
router.get("/", authMiddleware, users.getAllUsers);

// Get user by ID
router.get("/:id", authMiddleware, users.getUserById);

// Create user
router.post("/", authMiddleware, users.createUser);

// Update user
router.patch("/:id", authMiddleware, users.updateUserById);

// Delete user
router.delete("/:id", authMiddleware, users.deleteUser);

export default router;