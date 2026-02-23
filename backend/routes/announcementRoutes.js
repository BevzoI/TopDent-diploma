import express from "express";
import {
  createAnnouncement,
  getMyAnnouncements,
} from "../controllers/announcementController.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

router.post("/", isAdmin, createAnnouncement);
router.get("/my", getMyAnnouncements);

export default router;