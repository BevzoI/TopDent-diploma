import express from "express";
import * as weekend from "../controllers/weekendController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, weekend.getAllWeekend);
router.get("/:id", authMiddleware, weekend.getOneWeekend);

router.post("/", authMiddleware, weekend.createWeekend);

router.patch(
  "/:id/status",
  authMiddleware,
  adminOnly,
  weekend.updateWeekendStatus,
);

router.delete("/:id", authMiddleware, weekend.deleteWeekend);

export default router;
