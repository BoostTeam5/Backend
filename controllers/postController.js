import {
  NotFoundError,
  WrongPasswordError,
  BadRequestError,
} from "../utils/customError";
import { comparePassword, hashPassword } from "../utils/passwordUtils";
import { PrismaClient } from "@prisma/client";
//배지, 태그관련 import 필요

const prisma = new PrismaClient();

const getPostDetailsById = async (postId) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        groupId: true,
        nickname: true,
        title: true,
        content: true,
        imageUrl: true,
        location: true,
        moment: true,
        isPublic: true,
        likeCount: true,
        createdAt: true,
        PostTags: {
          select: {
            Tag: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundError();
    }

    const postData = post;
    postData.tags = post.PostTags.map((postTag) => postTag.Tag.name);
    postData.commentCount = await getCommentCountByPostId(postId);

    return postData;
  } catch (err) {
    throw err;
  }
};

const getCommentCountByPostId = async (postId) => {
  try {
    const commentCount = await prisma.comment.count({
      where: { postId },
    });
    return commentCount;
  } catch (err) {
    throw err;
  }
};

// 게시글 상세 조회
exports.getPostById = async (req, res, next) => {
  const { postId } = req.params;

  try {
    const postWithDetails = await getPostDetailsById(postId);

    return res.status(200).send(postWithDetails);
  } catch (err) {
    next(err);
  }
};

// 게시글 조회 권한 확인
exports.verifyPostPassword = async (req, res, next) => {
  const { postId } = req.params;
  const { password } = req.body;

  try {
    // 데이터베이스에서 해당 게시글 찾기
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundError();
    }

    if (!password) {
      throw new BadRequestError();
    }

    // 비밀번호 확인
    const isMatch = await comparePassword(password, post.password);
    if (!isMatch) {
      throw new WrongPasswordError();
    }

    // 비밀번호가 일치할 경우 성공 메시지 반환
    return res.status(200).json({ message: "비밀번호가 확인되었습니다" });
  } catch (err) {
    next(err);
  }
};

// 게시글 공감하기
exports.likePost = async (req, res, next) => {
  const { postId } = req.params;

  try {
    // 데이터베이스에서 해당 게시글 찾기
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundError();
    }

    const updatePost = await prisma.post.update({
      where: { id: postId },
      data: { likecount: post.likeCount + 1 },
    });

    // 변경된 게시글 저장
    await post.save();

    // 배지 조건 확인
    await checkPostLikeCount(postId);

    return res.status(200).json({ message: "게시글 공감하기 성공" });
  } catch (err) {
    next(err);
  }
};

// 게시글 공개 여부 확인
exports.isPostPublic = async (req, res, next) => {
  const { postId } = req.params;

  try {
    // 데이터베이스에서 해당 게시글 찾기
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, isPublic: true },
    });

    if (!post) {
      throw new NotFoundError();
    }

    // 공개 여부 반환
    return res.status(200).json({
      id: post.id,
      isPublic: post.isPublic,
    });
  } catch (err) {
    next(err);
  }
};
