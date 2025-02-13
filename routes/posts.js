import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// 게시글 수정 API (PUT /api/posts/:postId)
router.put('/:postId', async (req, res) => {
  const { postId } = req.params;
  const { postPassword, title, content, imageUrl, location, moment, isPublic, tags } = req.body;

  if (!postPassword) {
    return res.status(400).json({ "message": "잘못된 요청입니다"});
  }

  try {
    const connection = await pool.getConnection();

    // 게시글 비밀번호 검증
    const [postResult] = await connection.query(`SELECT postPassword FROM posts WHERE postId = ?`, [postId]);

    if (postResult.length === 0) {
      connection.release();
      return res.status(404).json({ "message": "존재하지 않습니다"});
    }

    if (postResult[0].postPassword !== postPassword) {
      connection.release();
      return res.status(403).json({ "message": "비밀번호가 틀렸습니다" });
    }

    // 게시글 내용 업데이트
    await connection.query(
      `UPDATE posts SET title = ?, content = ?, imageUrl = ?, location = ?, moment = ?, isPublic = ? WHERE postId = ?`,
      [title, content, imageUrl, location, moment, isPublic, postId]
    );

    // 태그 업데이트
    if (tags && tags.length > 0) {
      await connection.query(`DELETE FROM post_tags WHERE postId = ?`, [postId]);

      for (const tag of tags) {
        let [tagResult] = await connection.query(`SELECT tagId FROM tags WHERE tagName = ?`, [tag]);
        let tagId;

        if (tagResult.length === 0) {
          const [insertTag] = await connection.query(`INSERT INTO tags (tagName) VALUES (?)`, [tag]);
          tagId = insertTag.insertId;
        } else {
          tagId = tagResult[0].id;
        }

        await connection.query(`INSERT INTO post_tags (postId, tagId) VALUES (?, ?)`, [postId, tagId]);
      }
    }

    // 수정된 게시글 가져오기
    const [updatedPostResult] = await connection.query(
      `SELECT p.postId, p.groupId, p.nickname, p.title, p.content, p.imageUrl, p.location, 
              p.moment, p.isPublic, p.likeCount, p.commentCount, p.createdAt,
              GROUP_CONCAT(DISTINCT t.tagName) AS tags
       FROM posts p
       LEFT JOIN post_tags pt ON p.postId = pt.postId
       LEFT JOIN tags t ON pt.tagId = t.tagId
       WHERE p.postId = ?
       GROUP BY p.postId`, [postId]
    );

    connection.release();

    if (updatedPostResult.length === 0) {
      return res.status(500).json({ error: '게시글을 업데이트한 후 불러오는 데 실패했습니다.' });
    }

    // ✅ 응답 데이터 가공
    const updatedPost = updatedPostResult[0];
    updatedPost.tags = updatedPost.tags ? updatedPost.tags.split(',') : [];

    res.json(updatedPost);

  } catch (error) {
    console.error('❌ 게시글 수정 오류:', error);
    res.status(500).json({ error: '서버 오류로 게시글을 수정할 수 없습니다.' });
  }
});

// 게시글 삭제 API (DELETE /api/posts/:postId)
router.delete('/:postId', async (req, res) => {
  const { postId } = req.params;
  const { postPassword } = req.body; // 요청 바디에서 비밀번호 받기

  if (!postPassword) {
    return res.status(400).json({ "message": "잘못된 요청입니다" });
  }

  try {
    const connection = await pool.getConnection();

    // 게시글 존재 여부 및 비밀번호 검증
    const [postResult] = await connection.query(`SELECT postPassword FROM posts WHERE postId = ?`, [postId]);

    if (postResult.length === 0) {
      connection.release();
      return res.status(404).json({  "message": "존재하지 않습니다"});
    }

    if (postResult[0].postPassword !== postPassword) {
      connection.release();
      return res.status(403).json({ "message": "비밀번호가 틀렸습니다" });
    }

    // 게시글 삭제 (연관된 태그(post_tags) 자동 삭제)
    await connection.query(`DELETE FROM posts WHERE postId = ?`, [postId]);

    connection.release();

    res.json({ "message": "게시글 삭제 성공" });

  } catch (error) {
    console.error('❌ 게시글 삭제 오류:', error);
    res.status(500).json({ error: '서버 오류로 게시글을 삭제할 수 없습니다.' });
  }
});

export default router;