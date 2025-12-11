import express from "express";
import * as chat from '../controllers/chatController.js';

const router = express.Router();

router.post("/", chat.createChat);
router.get("/", chat.getAllChats);
router.get("/:id", chat.getOneChat);
router.patch("/:id", chat.updateChat);
router.delete("/:id", chat.deleteChat);
router.post("/:id/message", chat.sendMessage);
router.get("/:id/messages", chat.getNewMessages);


export default router;
