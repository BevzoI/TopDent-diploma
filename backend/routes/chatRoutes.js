import express from "express";
import {
  getChats,
  getChatById,
  createChat,
  updateChat,
  deleteChat,
  sendMessage,
} from "../controllers/chatController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

/* =====================================================
   GET – pouze přihlášení uživatelé
===================================================== */

router.get("/", authMiddleware, getChats);
router.get("/:id", authMiddleware, getChatById);

/* =====================================================
   ADMIN – vytváření a úpravy chatu
===================================================== */

router.post("/", authMiddleware, adminOnly, createChat);
router.patch("/:id", authMiddleware, adminOnly, updateChat);
router.delete("/:id", authMiddleware, adminOnly, deleteChat);

/* =====================================================
   SEND MESSAGE + FILE UPLOAD
===================================================== */

router.post("/:id/message", authMiddleware, upload.array("files"), sendMessage);

export default router;
