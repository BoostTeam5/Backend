import {
  NotFoundError,
  WrongPasswordError,
  BadRequestError,
} from "../utils/customError";
import { comparePassword, hashPassword } from "../utils/passwordUtils";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

exports.getPost = async (req, res, next) => {
  const { groupId } = req.params;
  const {
    page = 1,
    pageSize = 10,
    sortBy = "latest",
    keyword = "",
    isPublic = true,
  } = req.query;

  try {
    const group = await prisma.group.findUnique({ where: { id: groupId } }); // findUniqe -> prisma 메소드

    if (!group) {
      throw new BadRequestError();
    }

    // 페이지네이션 설정
    const limit = parseInt(pageSize, 10);
    const offset = (parseInt(page, 10) - 1) * limit;

    const sortOptions = {
      latest: { createdAt: "DESC" },
      mostCommented: { commentCount: "DESC" },
      mostLiked: { likeCount: "DESC" },
    };

    const posts = await prisma.post.findMany({
      skip: offset,
      take: limit,
      orderBy: sortOptions[sortBy],
      where: {
        OR: [
          { title: { contains: keyword } },
          {
            PostTags: {
              some: {
                Tag: {
                  name: { contains: keyword },
                },
              },
            },
          },
        ],
        isPublic,
        groupId,
      },
      include: {
        _count: {
          select: { Comments: true },
        },
      },
    });

    const currentPage = parseInt(page);
    const totalPages = Math.ceil(totalItemCount / limit);

    const response = {
      currentPage,
      totalPages,
      totalItemCount,
      data: posts,
    };

    res.send(response);
  } catch (err) {
    next(err);
  }
};

// 게시글 수정
exports.updatePost = async (req, res, next) => {
  const { postId } = req.params;
  const {
    nickname,
    title,
    content,
    postPassword,
    imageUrl,
    tags,
    location,
    moment,
    isPublic,
  } = req.body;

  try {
    // 데이터베이스에서 해당 게시글 찾기
    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
      throw new NotFoundError();
    }

    // 필수 필드 확인
    if (!nickname || !title || !content || !postPassword) {
      throw new BadRequestError();
    }

    // 비밀번호 확인
    const isMatch = await comparePassword(postPassword, post.password);
    if (!isMatch) {
      throw new WrongPasswordError();
    }

    // 게시글 내용 수정
    const updatePost = await prisma.post.update({
      where: { id: postId },
      data: {
        nickname,
        title,
        content,
        imageUrl,
        tags,
        location,
        moment,
        isPublic,
      },
    });

    // 변경된 게시글 저장
    await post.save();

    // 변경된 태그 수정
    await updateTags(tags, postId);

    const postWithDetails = await getPostDetailsById(postId);
    // 수정된 게시글의 응답 반환
    return res.status(200).send(postWithDetails);
  } catch (err) {
    next(err);
  }
};

// 게시글 삭제
exports.deletePost = async (req, res, next) => {
  const { postId } = req.params;
  const { postPassword } = req.body;

  try {
    // 데이터베이스에서 해당 게시글 찾기
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundError();
    }

    if (!postPassword) {
      throw new BadRequestError();
    }

    // 비밀번호 확인
    const isMatch = await comparePassword(postPassword, post.password);
    if (!isMatch) {
      throw new WrongPasswordError();
    }

    // 게시글 삭제
    await prisma.post.delete({
      where: { id: postId },
    });

    return res.status(200).json({ message: "게시글 삭제 성공" });
  } catch (err) {
    next(err);
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
