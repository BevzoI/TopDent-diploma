import express from "express";
import {
  getChats,
  getChatById,
  createChat,
  updateChat,
  deleteChat,
  sendMessage,
  uploadChatImage,
  uploadChatAudio,
  editMessage,
  deleteMessageForMe,
  deleteMessageForEveryone,
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
   CHAT UPLOADS
===================================================== */

router.post(
  "/upload-image",
  authMiddleware,
  upload.single("file"),
  uploadChatImage,
);

router.post(
  "/upload-audio",
  authMiddleware,
  upload.single("file"),
  uploadChatAudio,
);

/* =====================================================
   SEND MESSAGE
===================================================== */

router.post("/:id/message", authMiddleware, upload.array("files"), sendMessage);

/* =====================================================
   MESSAGE ACTIONS
===================================================== */

router.patch("/:chatId/message/:messageId", authMiddleware, editMessage);

router.patch(
  "/:chatId/message/:messageId/delete-for-me",
  authMiddleware,
  deleteMessageForMe,
);

router.patch(
  "/:chatId/message/:messageId/delete-for-everyone",
  authMiddleware,
  deleteMessageForEveryone,
);

export default router;
