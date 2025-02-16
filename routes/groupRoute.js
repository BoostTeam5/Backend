import express from "express";
import { createGroup, getGroups, updateGroup } from "../controllers/groupController.js";

const router = express.Router();

//그룹 생성하기
router.post("/groups", createGroup);

//그룹 조회하기
router.get("/groups", getGroups);

//그룹 수정하기
router.put("/groups/:groupId", updateGroup);

export default router;