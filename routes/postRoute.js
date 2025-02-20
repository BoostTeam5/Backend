import express from "express";
import postController from "../controllers/postController.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// 게시글 상세 정보 조회
router.get("/api/posts/:postId", postController.getPostById);
// 게시글 조회 권한 확인
router.post(
  "/api/posts/:postId/verify-password",
  postController.verifyPostPassword
);
// 게시글 공감하기
router.post("/api/posts/:postId/like", postController.likePost);
// 게시글 공개 여부 확인
router.get("/api/posts/:postId/is-public", postController.isPostPublic);
//게시글 등록
router.post(
  "/api/groups/:groupId/posts",
  upload.single("image"),
  postController.createPost
);
//게시글 목록 조회
router.get("/api/groups/:groupId/posts", postController.getPostsByGroup);
//게시글 수정
router.put("/api/posts/:postId", postController.updatePost);
//게시글 삭제
router.delete("/api/posts/:postId", postController.deletePost);

export default router;
