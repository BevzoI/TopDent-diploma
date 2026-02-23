import express from "express";
import { getAllGroups, createGroup } from "../controllers/groupsController.js";

const router = express.Router();

// GET всі групи
router.get("/", getAllGroups);

// POST створити групу (поки без middleware)
router.post("/", createGroup);

export default router;