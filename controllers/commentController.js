import { createComment, checkPostExists, getCommentCount, getComments, getCommentById, updateComment, deleteComment } from "../models/commentModel.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

//댓글 등록
export async function addComment(req, res) {
  const { postId } = req.params;
  const { nickname, content, password } = req.body;

  if (!nickname || !content || !password) {
    return res.status(400).json({ message: "잘못된 요청입니다" });
  }

  try {
    //해당 postId가 존재하는지 확인
    const parsedPostId = parseInt(postId, 10);
    const postExists = await checkPostExists(parsedPostId);
    if (!postExists) {
      return res.status(400).json({ message: "존재하지 않는 게시글입니다" });
    }

    const newComment = await createComment(parsedPostId, nickname, content, password);

    await prisma.posts.update({
      where: { postId:parsedPostId },
      data: { commentCount: { increment: 1 } }, // Prisma의 increment 기능
    });
    console.log(`게시글 ${parsedPostId} 댓글 개수 증가됨`);

    return res.status(200).json({
      id: newComment.commentId,
      nickname: newComment.nickname,
      content: newComment.content,
      createdAt: newComment.createdAt,
    });
  } catch (error) {
    console.error("댓글 등록 오류:", error);
    return res.status(500).json({ message: "서버 오류" });
  }
}


//댓글 목록 조회
export async function getCommentList(req, res) {
    const { postId } = req.params;
    let { page, pageSize } = req.query;
  
    //기본값 설정 (page=1, pageSize=10)
    page = parseInt(page) || 1;
    pageSize = parseInt(pageSize) || 10;

    //필수 파라미터 검증
    if (!page || !pageSize || isNaN(page) || isNaN(pageSize) || page < 1 || pageSize < 1) {
      return res.status(400).json({ message: "잘못된 요청입니다" });
    }
  
    try {
      const totalItemCount = await getCommentCount(postId);
      const totalPages = Math.ceil(totalItemCount / pageSize);
      const comments = await getComments(postId, parseInt(page), parseInt(pageSize));
  
      return res.status(200).json({
        currentPage: parseInt(page),
        totalPages: totalPages,
        totalItemCount: totalItemCount,
        data: comments.map((comment) => ({
          id: comment.commentId,
          nickname: comment.nickname,
          content: comment.content,
          createdAt: comment.createdAt,
        })),
      });
    } catch (error) {
      console.error("댓글 목록 조회 오류:", error);
      return res.status(500).json({ message: "서버 오류" });
    }
}


//댓글 수정
export async function editComment(req, res) {
    const { commentId } = req.params;
    const { nickname, content, password } = req.body;
  
    if (!nickname || !content || !password) {
      return res.status(400).json({ message: "잘못된 요청입니다" });
    }
  
    try {
      const updatedComment = await updateComment(commentId, nickname, content, password);
  
      if (updatedComment === null) {
        return res.status(404).json({ message: "존재하지 않습니다" });
      }
      if (updatedComment === false) {
        return res.status(403).json({ message: "비밀번호가 틀렸습니다" });
      }
  
      return res.status(200).json({
        id: updatedComment.commentId,
        nickname: updatedComment.nickname,
        content: updatedComment.content,
        createdAt: updatedComment.createdAt,
      });
    } catch (error) {
      console.error("댓글 수정 오류:", error);
      return res.status(500).json({ message: "서버 오류" });
    }
}

//댓글 삭제
export async function removeComment(req, res) {
    const { commentId } = req.params;
    const { password } = req.body;
  
    if (!password) {
      return res.status(400).json({ message: "잘못된 요청입니다" });
    }
  
    try {
      const result = await deleteComment(commentId, password);
  
      if (result === null) {
        return res.status(404).json({ message: "존재하지 않습니다" });
      }
      if (result === false) {
        return res.status(403).json({ message: "비밀번호가 틀렸습니다" });
      }
  
      return res.status(200).json({ message: "답글 삭제 성공" });
    } catch (error) {
      console.error("댓글 삭제 오류:", error);
      return res.status(500).json({ message: "서버 오류" });
    }
}