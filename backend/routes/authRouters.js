// routes/authRouters.js
import express from "express";
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.post("/", authController.auth);
router.post("/create", authController.createUser);

export default router;
