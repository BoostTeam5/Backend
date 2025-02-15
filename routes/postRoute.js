import express from "express";
import postController from "../controllers/postController";

const router = express();

// 게시글 상세 정보 조회
router.get("/:postId", postController.getPostById);

// 게시글 조회 권한 확인
router.post("/:postId/verify-password", postController.verifyPostPassword);

// 게시글 공감하기
router.post("/:postId/like", postController.likePost);

// 게시글 공개 여부 확인
router.get("/:postId/is-public", postController.isPostPublic);

module.exports = router;
