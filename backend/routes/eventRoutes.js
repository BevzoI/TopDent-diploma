import express from "express";
import * as event from '../controllers/eventController.js';

const router = express.Router();

router.post("/", event.createEvent);
router.get("/", event.getAllEvents);
router.get("/:id", event.getOneEvent);
router.patch("/:id", event.updateEvent);
router.delete("/:id", event.deleteEvent);
router.patch("/:id/answer", event.answerEvent);

export default router;
