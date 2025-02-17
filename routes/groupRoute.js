// routes/groupRoute.js
import express from "express";
import { createGroup, getGroups, updateGroup, getGroupDetails, verifyGroupPassword, checkGroupPublicStatus, likeGroup } from "../controllers/groupController.js";

const router = express.Router();

// 그룹 생성하기
router.post("/groups", createGroup);

// 그룹 수정하기
router.put("/groups/:groupId", updateGroup);

// 그룹 리스트 조회
router.get("/groups", getGroups);

// 그룹 상세보기 조회
router.get("/groups/:groupId", getGroupDetails);  // <-- groupId를 URL 파라미터로 받음

// 권한 확인하기
router.post('/groups/:groupId/verify-password', verifyGroupPassword);

// 그룹 공개 여부 확인하기 
router.get('/groups/:groupId/is-public', checkGroupPublicStatus);

// 그룹 공감하기
router.post("/groups/:groupId/like", likeGroup);

export default router;
