// routes/usersRouters.js
import express from "express";
import * as users from '../controllers/usersController.js';

const router = express.Router();

// LIST + DETAILS
router.get("/", users.getAllUsers);
router.get("/:id", users.getUserById);
router.post("/", users.createUser);
router.patch("/:id", users.updateUserById);
router.delete("/:id", users.deleteUser);
router.get("/notify/:userId", users.getUserNotifications);

export default router;
