import express from "express";
import {
  getChats,
  getChatById,
  createChat,
  updateChat,
  deleteChat,
  sendMessage,
} from "../controllers/chatController.js";

const router = express.Router();

router.get("/", getChats);
router.get("/:id", getChatById);
router.post("/", createChat);
router.patch("/:id", updateChat);
router.delete("/:id", deleteChat);
router.post("/:id/message", sendMessage);

export default router;