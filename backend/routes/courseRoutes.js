import express from "express";
import * as course from '../controllers/courseController.js';

const router = express.Router();

router.post("/", course.createCourse);
router.get("/", course.getAllCourses);
router.get("/:id", course.getOneCourse);
router.patch("/:id", course.updateCourse);
router.delete("/:id", course.deleteCourse);
router.patch("/:id/answer", course.answerCourse);

export default router;
