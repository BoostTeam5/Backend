import express from "express";
import { createGroup, getGroups } from "../controllers/groupController.js";

const router = express.Router();

//그룹 생성하기
router.post("/groups", createGroup);

//그룹 조회하기
router.get("/groups", getGroups);

export default router;