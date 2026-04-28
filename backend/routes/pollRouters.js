import express from "express";
import * as poll from "../controllers/pollController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, poll.getAllPolls);
router.get("/:id", authMiddleware, poll.getOnePoll);

router.post("/", authMiddleware, adminOnly, poll.createPoll);
router.patch("/:id", authMiddleware, adminOnly, poll.updatePoll);
router.delete("/:id", authMiddleware, adminOnly, poll.deletePoll);

router.patch("/:id/answer", authMiddleware, poll.answerPoll);

export default router;
