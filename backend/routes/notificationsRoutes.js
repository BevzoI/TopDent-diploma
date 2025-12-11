import express from "express";
import * as notifications from "../controllers/notificationsController.js";

const router = express.Router();

router.get("/:userId", notifications.getUserNotifications);

export default router;
