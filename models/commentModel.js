import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

//댓글 저장
export async function createComment(postId, nickname, content, password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return prisma.comments.create({
    data: {
      postId: parseInt(postId),
      nickname,
      content,
      password: hashedPassword,
    },
  });
}

//특정 postId가 존재하는지 확인
export async function checkPostExists(postId) {
  return prisma.posts.findUnique({
    where: { postId: parseInt(postId) },
  });
}


export async function getCommentCount(postId) {
    return prisma.comments.count({
      where: { postId: parseInt(postId) },
    });
  }
  
  //댓글 목록 조회 (페이징 적용)
  export async function getComments(postId, page, pageSize) {
    const skip = (page - 1) * pageSize; // 페이징 계산
    return prisma.comments.findMany({
      where: { postId: parseInt(postId) },
      orderBy: { createdAt: "desc" }, // 최신순 정렬
      skip: skip,
      take: parseInt(pageSize),
      select: {
        commentId: true,
        nickname: true,
        content: true,
        createdAt: true,
      },
    });
  }