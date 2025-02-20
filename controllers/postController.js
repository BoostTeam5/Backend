import {
  BadRequestError,
  WrongPasswordError,
  NotFoundError,
} from "../utils/customError.js";
import { comparePassword, hashPassword } from "../utils/passwordUtils.js";
import { PrismaClient } from "@prisma/client";
import {
  createPostService,
  getPostsByGroupService,
  updatePostService,
  deletePostService,
} from "../services/postService.js";
import { uploadFileToS3, deleteFileFromS3 } from "../services/imageService.js";
import {
  checkConsecutiveDays,
  checkPostCount,
  checkPostLikeCount,
} from "../services/badgeService.js";

const createPost = async (req, res) => {
  const { groupId } = req.params;
  const {
    nickname,
    title,
    content,
    postPassword,
    tags,
    location,
    moment,
    isPublic,
    imageUrl, // 프론트에서 받아온 이미지 URL
  } = req.body;

  if (!nickname || !title || !content) {
    return res.status(400).json({ message: "잘못된 요청입니다" });
  }

  try {
    let parsedIsPublic =
      typeof isPublic === "string"
        ? isPublic.toLowerCase() === "true"
        : !!isPublic;
    let parsedTags = Array.isArray(tags) ? tags : [];

    // 비밀번호 해시화
    const hashedPassword = await hashPassword(postPassword);

    const newPost = await createPostService({
      groupId: parseInt(groupId),
      nickname,
      title,
      content,
      postPassword: hashedPassword, // 해시된 비밀번호 저장
      imageUrl, // 기존 로직 없이 받아온 imageUrl 사용
      tags: parsedTags,
      location,
      moment,
      isPublic: parsedIsPublic,
    });

    await prisma.groups.update({
      where: { groupId: parseInt(groupId) },
      data: { postCount: { increment: 1 } }, // postCount 값을 1 증가
    });

    res.status(201).json({
      id: newPost.postId,
      groupId: newPost.groupId,
      nickname: newPost.nickname,
      title: newPost.title,
      content: newPost.content,
      imageUrl: newPost.imageUrl,
      tags: newPost.tags,
      location: newPost.location,
      moment: newPost.moment?.toISOString().split("T")[0],
      isPublic: newPost.isPublic,
      likeCount: newPost.likeCount,
      commentCount: newPost.commentCount,
      createdAt: newPost.createdAt.toISOString(),
    });

    //1,2번 배지 조건 확인
    await checkPostCount(newPost.groupId);
    console.log("배지1 조건 체크 완료");
    await checkConsecutiveDays(newPost.groupId);
    console.log("배지2 조건 체크 완료");
  } catch (error) {
    console.error("게시글 등록 오류:", error);
    res.status(500).json({ error: "서버 오류로 게시글을 등록할 수 없습니다." });
  }
};

//그룹별 게시물 조회(GET)
const getPostsByGroup = async (req, res) => {
  const { groupId } = req.params;
  const {
    page = 1,
    pageSize = 10,
    sortBy = "latest",
    keyword,
    isPublic,
  } = req.query;

  try {
    //서비스 호출
    const postsData = await getPostsByGroupService({
      groupId: parseInt(groupId),
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      sortBy,
      keyword,
      isPublic: isPublic === "true", // Boolean 변환
    });

    const formattedResponse = {
      currentPage: postsData.currentPage || 1,
      totalPages: postsData.totalPages || 1,
      totalItemCount: postsData.totalItemCount || 0,
      data: (postsData.data || []).map((post) => ({
        id: post.postId,
        nickname: post.nickname,
        title: post.title,
        imageUrl: post.imageUrl,
        tags: post.post_tags ? post.post_tags.map((pt) => pt.tags.tagName) : [],
        location: post.location,
        moment: post.moment ? post.moment.toISOString().split("T")[0] : null,
        isPublic: Boolean(post.isPublic),
        likeCount: post.likeCount,
        commentCount: post.commentCount,
        createdAt: post.createdAt ? post.createdAt.toISOString() : null,
      })),
    };

    res.json(formattedResponse);
  } catch (error) {
    console.error("게시글 조회 오류:", error);
    res.status(500).json({ error: "서버 오류로 게시글을 가져올 수 없습니다." });
  }
};

//게시물 수정(PUT)
const updatePost = async (req, res) => {
  const { postId } = req.params;
  const updateData = req.body;

  // 400 : Bad Request : postId, updateData가 포함되지 않은 경우
  if (!postId || isNaN(postId)) {
    return res.status(400).json({ message: "잘못된 요청입니다" });
  }
  if (!updateData || Object.keys(updateData).length === 0) {
    return res.status(400).json({ message: "잘못된 요청입니다" });
  }

  try {
    const updatedPost = await updatePostService({
      postId: parseInt(postId),
      updateData,
    });

    if (!updatedPost) {
      // 404 오류 : 게시물이 없는 경우
      return res.status(404).json({ message: "존재하지 않습니다" });
    }

    const formattedResponse = {
      id: updatedPost.postIdd,
      groupId: updatedPost.groupId,
      nickname: updatedPost.nickname,
      title: updatedPost.title,
      content: updatedPost.content,
      imageUrl: updatedPost.imageUrl,
      tags: updatedPost.post_tags.map((pt) => pt.tags.tagName),
      location: updatedPost.location,
      moment: updatedPost.moment
        ? updatedPost.moment.toISOString().split("T")[0]
        : null,
      isPublic: Boolean(updatedPost.isPublic),
      likeCount: updatedPost.likeCount,
      commentCount: updatedPost.commentCount,
      createdAt: updatedPost.createdAt.toISOString(),
    };

    res.status(200).json(formattedResponse);
  } catch (error) {
    if (error.message === "비밀번호가 틀렸습니다.") {
      // 403 : 비밀 번호를 틀린 경우
      return res.status(403).json({ message: "비밀번호가 틀렸습니다" });
    }
    console.error("게시글 수정 오류:", error);
    res.status(500).json({ message: "게시글을 수정할 수 없습니다." });
  }
};

export const deletePost = async (req, res) => {
  const { postId } = req.params;
  const { postPassword } = req.body; // 클라이언트가 비밀번호를 보내야 함

  if (!postId || isNaN(postId)) {
    return res.status(400).json({ message: "잘못된 요청입니다" });
  }

  try {
    // ✅ 불필요한 post 변수를 사용하지 않음
    const result = await deletePostService({
      postId: parseInt(postId),
      postPassword,
    });

    res.status(200).json(result);
  } catch (error) {
    if (error.message === "존재하지 않습니다.") {
      return res.status(404).json({ message: "존재하지 않습니다" });
    }
    if (error.message === "비밀번호가 틀렸습니다.") {
      return res.status(403).json({ message: "비밀번호가 틀렸습니다." });
    }

    console.error("게시글 삭제 오류:", error);
    res.status(500).json({ message: "게시글을 삭제할 수 없습니다." });
  }
};

const prisma = new PrismaClient();

const getPostDetailsById = async (postId) => {
  try {
    const post = await prisma.posts.findUnique({
      where: {
        postId: parseInt(postId, 10), // postId를 정수로 변환
      },
      select: {
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
        commentCount: true,
        post_tags: {
          select: {
            tags: {
              select: {
                tagName: true,
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
    post.tags = post.PostTags
      ? post.PostTags.map((postTag) => postTag.Tag.name)
      : [];
    postData.commentCount = await getCommentCountByPostId(postId);

    return postData;
  } catch (err) {
    throw err;
  }
};

const getCommentCountByPostId = async (postId) => {
  try {
    const commentCount = await prisma.comments.count({
      where: { postId },
    });
    return commentCount;
  } catch (err) {
    throw err;
  }
};

// 게시글 상세 조회
const getPostById = async (req, res, next) => {
  const { postId } = req.params;

  try {
    const postWithDetails = await getPostDetailsById(parseInt(postId, 10));

    return res.status(200).send(postWithDetails);
  } catch (err) {
    next(err);
  }
};

// 게시글 조회 권한 확인
const verifyPostPassword = async (req, res, next) => {
  const { postId } = req.params;
  const { password } = req.body;

  try {
    // 데이터베이스에서 해당 게시글 찾기
    const post = await prisma.posts.findUnique({
      where: { id: parseInt(postId) },
    });

    if (!post) {
      throw new NotFoundError();
    }

    if (!password) {
      throw new BadRequestError();
    }

    // 비밀번호 확인
    const isMatch = await comparePassword(password, post.postPassword);
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
const likePost = async (req, res, next) => {
  const { postId } = req.params;

  try {
    // 데이터베이스에서 해당 게시글 찾기
    const parsedPostId = parseInt(postId, 10);
    const post = await prisma.posts.findUnique({
      where: { postId: parsedPostId },
    });

    if (!post) {
      throw new NotFoundError();
    }

    const updatedPost = await prisma.posts.update({
      where: { postId: parsedPostId },
      data: { likeCount: post.likeCount + 1 },
    });

    console.log(`게시글 ${postId} 공감 수 증가 완료`);

    // 5번 배지 조건 확인
    await checkPostLikeCount(parsedPostId);
    console.log(`배지5 조건 확인 완료`);

    return res.status(200).json({
      message: "게시글 공감하기 성공",
      likeCount: updatedPost.likeCount,
    });
  } catch (err) {
    next(err);
  }
};

// 게시글 공개 여부 확인
const isPostPublic = async (req, res, next) => {
  const { postId } = req.params;

  try {
    // 데이터베이스에서 해당 게시글 찾기
    const post = await prisma.posts.findUnique({
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

const postController = {
  createPost,
  getPostsByGroup,
  updatePost,
  deletePost,
  getPostById,
  verifyPostPassword,
  likePost,
  isPostPublic,
};

export default postController;
