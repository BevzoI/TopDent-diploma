import express from "express";
import { getAllGroups, createGroup } from "../controllers/groupsController.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

router.get("/", getAllGroups);
router.post("/", isAdmin, createGroup);

export default router;