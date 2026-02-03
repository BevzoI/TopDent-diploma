import express from "express";
import { inviteUser } from "../controllers/admin.controller.js";
// admin middleware додамо на наступному кроці
const router = express.Router();

router.post("/invite-user", inviteUser);

export default router;
