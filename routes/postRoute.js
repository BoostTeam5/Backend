import express from "express";
import postController from "../controllers/postController";
import { createPost, getPostsByGroup, updatePost, delePost } from '../controllers/postController.js'; 
//댓글 관련 내용 추가 필요

const router = express.Router();

// 게시글 상세 정보 조회
router.get("/:postId", postController.getPostById);
// 게시글 조회 권한 확인
router.post("/:postId/verify-password", postController.verifyPostPassword);
// 게시글 공감하기
router.post("/:postId/like", postController.likePost);
// 게시글 공개 여부 확인
router.get("/:postId/is-public", postController.isPostPublic);
//게시글 등록
router.post('/groups/:groupId/posts', createPost);
//게시글 목록 조회
router.get('/groups/:groupId/posts', getPostsByGroup);
//게시글 수정
router.put('/posts/:postId', updatePost);
//게시글 삭제
router.delete('/posts/:postId', deletePost);

module.exports = router;
