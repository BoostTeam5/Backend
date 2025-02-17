import express from "express";
import { addComment,getCommentList,editComment,removeComment } from "../controllers/commentController.js";

const router = express.Router();

//댓글 등록
router.post("/api/posts/:postId/comments", addComment);

//댓글 목록 조회
router.get("/api/posts/:postId/comments", getCommentList);

//댓글 수정
router.put("/api/comments/:commentId", editComment);

//댓글 삭제
router.delete("/api/comments/:commentId", removeComment);

export default router;
