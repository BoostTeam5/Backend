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
