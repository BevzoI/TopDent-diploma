import express from "express";
import {
  getGroups,
  createGroup,
  deleteGroup,
} from "../controllers/groupsController.js";

const router = express.Router();

router.get("/", getGroups);
router.post("/", createGroup);
router.delete("/:id", deleteGroup);

export default router;