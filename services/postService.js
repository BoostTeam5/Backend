import prisma from "../config/prismaClient.js";
import { deleteFileFromS3 } from "../services/imageService.js";
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";

//게시물 생성(POST)
export const createPostService = async (postData) => {
  return await prisma.posts.create({
    data: {
      groupId: postData.groupId,
      nickname: postData.nickname,
      title: postData.title,
      content: postData.content,
      postPassword: postData.postPassword,
      imageUrl: postData.imageUrl,
      location: postData.location,
      moment: postData.moment ? new Date(postData.moment) : null,
      isPublic: postData.isPublic ?? true,
      post_tags: {
        create: postData.tags?.map((tag) => ({
          tags: {
            connectOrCreate: {
              where: { tagName: tag },
              create: { tagName: tag },
            },
          },
        })),
      },
    },
    include: {
      post_tags: {
        include: {
          tags: true,
        },
      },
    },
  });
};

// 그룹 게시물 조회 (GET)
export const getPostsByGroupService = async ({
  groupId,
  page = 1,
  pageSize = 10,
  sortBy,
  keyword,
  isPublic,
}) => {
  const skip = (page - 1) * pageSize;

  // 정렬 조건 설정 : latest | mostCommented | mostLiked
  let orderBy = { createdAt: "desc" }; // 기본값: 최신순
  if (sortBy === "mostCommented") {
    orderBy = { commentCount: "desc" };
  } else if (sortBy === "mostLiked") {
    orderBy = { likeCount: "desc" };
  }

  // keyword 안전 처리 (없으면 모든 게시글 조회)
  const safeKeyword = keyword ? `%${keyword.toLowerCase()}%` : "%%";

  // SQL 쿼리로 대소문자 무시 검색
  const posts = await prisma.$queryRaw`
    SELECT p.* 
    FROM posts p
    LEFT JOIN post_tags pt ON p.postId = pt.postId
    LEFT JOIN tags t ON pt.tagId = t.tagId
    WHERE p.groupId = ${groupId}
    AND (
      LOWER(p.title) LIKE ${safeKeyword}
      OR LOWER(p.content) LIKE ${safeKeyword}
      OR LOWER(t.tagName) LIKE ${safeKeyword}
    )
    ORDER BY p.createdAt DESC
    LIMIT ${pageSize} OFFSET ${skip};
  `;

  const totalItemCount = posts.length; // 검색된 게시글 개수

  return {
    currentPage: page,
    totalPages: Math.ceil(totalItemCount / pageSize) || 1,
    totalItemCount: totalItemCount || 0,
    data: posts || [],
  };
};

// 그룹 게시물 수정 (PUT)
export const updatePostService = async ({ postId, updateData }) => {
  // 기존 게시글 확인
  const existingPost = await prisma.posts.findUnique({
    where: { postId: parseInt(postId) },
    include: {
      post_tags: { include: { tags: true } },
    },
  });

  if (!existingPost) {
    throw new Error("해당 게시글을 찾을 수 없습니다.");
  }

  // 비밀번호 검증
  if (existingPost.postPassword) {
    const { postPassword } = updateData; // updateData에서 비밀번호 가져오기
    if (!postPassword) {
      throw new Error("비밀번호가 필요합니다."); // 비밀번호가 없으면 오류
    }
    const isMatch = await comparePassword(
      postPassword,
      existingPost.postPassword
    );
    if (!isMatch) {
      throw new Error("비밀번호가 틀렸습니다.");
    }
  }

  // 업데이트할 데이터 필터링
  const updateFields = {};
  if (updateData.nickname) updateFields.nickname = updateData.nickname;
  if (updateData.title) updateFields.title = updateData.title;
  if (updateData.content) updateFields.content = updateData.content;
  if (updateData.imageUrl) updateFields.imageUrl = updateData.imageUrl;
  if (updateData.location) updateFields.location = updateData.location;
  if (updateData.moment) updateFields.moment = new Date(updateData.moment);
  if (updateData.isPublic !== undefined)
    updateFields.isPublic = updateData.isPublic;

  // 태그 업데이트 처리
  if (updateData.tags) {
    await prisma.post_tags.deleteMany({
      where: { postId },
    });

    updateFields.post_tags = {
      create: updateData.tags.map((tag) => ({
        tags: {
          connectOrCreate: {
            where: { tagName: tag },
            create: { tagName: tag },
          },
        },
      })),
    };
  }

  // 게시글 업데이트
  const updatedPost = await prisma.posts.update({
    where: { postId: parseInt(postId) },
    data: updateFields,
    include: {
      post_tags: { include: { tags: true } },
    },
  });

  return updatedPost;
};

export async function deletePostService({ postId, postPassword }) {
  try {
    // 게시글 조회 (이미지 URL 포함)
    const post = await prisma.posts.findUnique({
      where: { postId: postId },
      select: {
        imageUrl: true,
        postPassword: true,
      },
    });

    if (!post) {
      throw new Error("존재하지 않습니다.");
    }

    // 비밀번호 검증
    if (post.postPassword) {
      const isMatch = await comparePassword(postPassword, post.postPassword);
      if (!isMatch) {
        throw new Error("비밀번호가 틀렸습니다.");
      }
    }

    // S3 이미지 삭제 (이미지가 존재할 경우)
    if (post.imageUrl) {
      const fileKey = post.imageUrl.replace(
        `${process.env.AWS_CLOUD_FRONT_URL}/`,
        ""
      ); // S3 파일 키 추출
      await deleteFileFromS3(fileKey);
    }

    // 게시글 삭제 (연관된 태그 데이터도 삭제)
    await prisma.post_tags.deleteMany({
      where: { postId: postId },
    });

    await prisma.posts.delete({
      where: { postId: postId },
    });

    return { message: "게시글 삭제 성공" };
  } catch (error) {
    throw error; // 컨트롤러에서 처리하도록 에러 던지기
  }
}
