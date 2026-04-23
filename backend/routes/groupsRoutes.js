import express from "express";
import {
  getGroups,
  createGroup,
  deleteGroup,
} from "../controllers/groupsController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getGroups);
router.post("/", authMiddleware, adminOnly, createGroup);
router.delete("/:id", authMiddleware, adminOnly, deleteGroup);

export default router;
