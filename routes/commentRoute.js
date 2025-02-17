import express from "express";
import { addComment } from "../controllers/commentController.js";

const router = express.Router();

//댓글 등록
router.post("/api/posts/:postId/comments", addComment);

export default router;
