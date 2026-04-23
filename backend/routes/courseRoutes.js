import express from "express";
import * as course from "../controllers/courseController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, course.getAllCourses);
router.get("/:id", authMiddleware, course.getOneCourse);

router.post("/", authMiddleware, adminOnly, course.createCourse);
router.patch("/:id", authMiddleware, adminOnly, course.updateCourse);
router.delete("/:id", authMiddleware, adminOnly, course.deleteCourse);

router.patch("/:id/answer", authMiddleware, course.answerCourse);

export default router;
