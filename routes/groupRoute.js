import express from "express";
import createGroup from "../controllers/groupController.js";

const router = express.Router();

//그룹 생성하기
router.post("/api/groups", createGroup);

export default router;