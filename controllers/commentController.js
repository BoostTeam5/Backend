import { createComment, checkPostExists } from "../models/commentModel.js";

export async function addComment(req, res) {
  const { postId } = req.params;
  const { nickname, content, password } = req.body;

  if (!nickname || !content || !password) {
    return res.status(400).json({ message: "잘못된 요청입니다" });
  }

  try {
    //해당 postId가 존재하는지 확인
    const postExists = await checkPostExists(postId);
    if (!postExists) {
      return res.status(400).json({ message: "존재하지 않는 게시글입니다" });
    }

    const newComment = await createComment(postId, nickname, content, password);

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
