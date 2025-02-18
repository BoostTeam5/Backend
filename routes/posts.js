import express from 'express';
import { createPost } from '../controllers/postController.js'; 
import { getPostsByGroup } from '../controllers/postController.js';
import { updatePost } from '../controllers/postController.js';
import { deletePost } from '../controllers/postController.js';
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); 

//게시글 등록
router.post("/groups/:groupId/posts", upload.single("image"), createPost);
//게시글 목록 조회
router.get('/groups/:groupId/posts', getPostsByGroup);
//게시글 수정
router.put('/posts/:postId', updatePost);
//게시글 삭제
router.delete('/posts/:postId', deletePost);

export default router;
