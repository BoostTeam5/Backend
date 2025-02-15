import { createPostService } from '../services/postService.js';
import { getPostsByGroupService } from '../services/postService.js';
import { updatePostService } from '../services/postService.js';
import { deletePostService } from '../services/postService.js';

//게시물 생성(POST)
export const createPost = async (req, res) => {
  const { groupId } = req.params;
  const { nickname, title, content, postPassword, imageUrl, tags, location, moment, isPublic } = req.body;

  // 요청 데이터 검증
  if (!nickname || !title || !content) {
    return res.status(400).json({"message": "잘못된 요청입니다"});
  }

  try {
    // 서비스에서 데이터 받아오기
    const newPost = await createPostService({
      groupId: parseInt(groupId),
      nickname,
      title,
      content,
      postPassword,
      imageUrl,
      tags,
      location,
      moment,
      isPublic
    });

    // 응답을 API 명세서에 맞게 가공
    const formattedPost = {
      id: newPost.postId,  
      groupId: newPost.groupId,
      nickname: newPost.nickname,
      title: newPost.title,
      content: newPost.content,
      imageUrl: newPost.imageUrl,
      tags: newPost.post_tags.map(pt => pt.tags.tagName),  
      location: newPost.location,
      moment: newPost.moment?.toISOString().split('T')[0],  
      isPublic: newPost.isPublic,
      likeCount: newPost.likeCount,
      commentCount: newPost.commentCount,
      createdAt: newPost.createdAt.toISOString()
    };

    res.status(200).json(formattedPost);

  } catch (error) {
    console.error('게시글 등록 오류:', error);
    res.status(500).json({ error: '서버 오류로 게시글을 등록할 수 없습니다.' });
  }
};

//그룹별 게시물 조회(GET)
export const getPostsByGroup = async (req, res) => {
    const { groupId } = req.params;
    const { page = 1, pageSize = 10, sortBy = 'latest', keyword, isPublic } = req.query;
  
    try {
      //서비스 호출
      const postsData = await getPostsByGroupService({
        groupId: parseInt(groupId),
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        sortBy,
        keyword,
        isPublic: isPublic === 'true'  // Boolean 변환
      });
  
      const formattedResponse = {
        currentPage: postsData.currentPage || 1,
        totalPages: postsData.totalPages || 1,
        totalItemCount: postsData.totalItemCount || 0,
        data: (postsData.data || []).map(post => ({
          id: post.postId,  
          nickname: post.nickname,
          title: post.title,
          imageUrl: post.imageUrl,
          tags: post.post_tags ? post.post_tags.map(pt => pt.tags.tagName) : [],  
          location: post.location,
          moment: post.moment ? post.moment.toISOString().split('T')[0] : null, 
          isPublic: Boolean(post.isPublic),
          likeCount: post.likeCount,
          commentCount: post.commentCount,
          createdAt: post.createdAt ? post.createdAt.toISOString() : null
        }))
      };
  
      res.json(formattedResponse);
    } catch (error) {
      console.error('게시글 조회 오류:', error);
      res.status(500).json({ error: '서버 오류로 게시글을 가져올 수 없습니다.' });
    }
  };

//게시물 수정(PUT)
export const updatePost = async (req, res) => {
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
      updateData
    });

    if (!updatedPost) {
      // 404 오류 : 게시물이 없는 경우 
      return res.status(404).json({ message: "존재하지 않습니다" });
    }

    const formattedResponse = {
      id: updatedPost.id,
      groupId: updatedPost.groupId,
      nickname: updatedPost.nickname,
      title: updatedPost.title,
      content: updatedPost.content,
      imageUrl: updatedPost.imageUrl,
      tags: updatedPost.post_tags.map(pt => pt.tags.tagName),
      location: updatedPost.location,
      moment: updatedPost.moment ? updatedPost.moment.toISOString().split('T')[0] : null,  
      isPublic: Boolean(updatedPost.isPublic),
      likeCount: updatedPost.likeCount,
      commentCount: updatedPost.commentCount,
      createdAt: updatedPost.createdAt.toISOString()
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

//게시물 삭제(DELETE)
export const deletePost = async (req, res) => {
  const { postId } = req.params;
  const { postPassword } = req.body; // 클라이언트가 비밀번호를 보내야 함

  // 400 Bad Request (잘못된 요청)
  if (!postId || isNaN(postId)) {
    return res.status(400).json({ "message": "잘못된 요청입니다" });
  }

  try {
    const result = await deletePostService({
      postId: parseInt(postId),
      postPassword
    });

    res.status(200).json(result);
  } catch (error) {
    if (error.message === "존재하지 않습니다.") {
      return res.status(404).json({ message: "존재하지 않습니다" }); // 404 Not Found
    }
    if (error.message === "비밀번호가 틀렸습니다.") {
      return res.status(403).json({ message: "비밀번호가 틀렸습니다" }); // 403 Forbidden
    }

    console.error("게시글 삭제 오류:", error);
    res.status(500).json({ message: "게시글을 삭제할 수 없습니다." });
  }
};