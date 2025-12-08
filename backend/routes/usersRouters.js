// routes/usersRouters.js
import express from "express";
import * as users from '../controllers/usersController.js';

const router = express.Router();

// LIST + DETAILS
router.get("/", users.getAllUsers);      // GET /users
router.get("/:id", users.getUserById);   // GET /users/:id

// CREATE
router.post("/", users.createUser);      // POST /users

// UPDATE
router.patch("/:id", users.updateUserById);     // PATCH /users/:id (сам користувач)

// DELETE
router.delete("/:id", users.deleteUser); // DELETE /users/:id (admin)

export default router;
