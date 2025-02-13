import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

router.post('/:groupId/posts', async (req, res) => {
  const { groupId } = req.params;
  const { groupPassword, nickname, title, content, postPassword, imageUrl, tags, location, moment, isPublic } = req.body;

  if (!nickname || !title || !content) {
    return res.status(400).json({ "message": "잘못된 요청입니다" });
  }

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // 그룹 비밀번호 검증
    const [groupResult] = await connection.query(`SELECT groupPassword FROM teams WHERE groupId = ?`, [groupId]);
    
    if (groupResult.length === 0) {
      throw new Error('존재하지 않는 그룹입니다.');
    }

    if (groupResult[0].groupPassword !== groupPassword) {
      throw new Error('그룹 비밀번호가 올바르지 않습니다.');
    }

    // 게시글 삽입
    const [postResult] = await connection.query(
      `INSERT INTO posts (groupId, nickname, title, content, postPassword, 
        imageUrl, location, moment, isPublic, likeCount, commentCount, createdAt) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [groupId, nickname, title, content, postPassword, imageUrl, location, moment, isPublic, 0, 0, new Date()]
    );

    const postId = postResult.insertId;

    // 태그 저장 및 연결 (생략 가능)
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        let [tagResult] = await connection.query(`SELECT tagId FROM tags WHERE tagName = ?`, [tag]);
        let tagId;

        if (tagResult.length === 0) {
          const [insertTag] = await connection.query(`INSERT INTO tags (tagName) VALUES (?)`, [tag]);
          tagId = insertTag.insertId;
        } else {
          tagId = tagResult[0].tagId;
        }

        await connection.query(`INSERT INTO post_tags (postId, tagId) VALUES (?, ?)`, [postId, tagId]);
      }
    }

    await connection.commit();

    res.status(200).json({
      id: postId,
      groupId: parseInt(groupId, 10),
      nickname,
      title,
      content,
      imageUrl,
      tags,
      location,
      moment,
      isPublic,
      likeCount: 0,
      commentCount: 0,
      createdAt: new Date().toISOString()
    });

  } catch (error) {
    await connection.rollback();
    console.error('❌ 게시글 등록 오류:', error);
    res.status(403).json({ error: error.message }); // 그룹 비밀번호 오류 시 403 반환
  } finally {
    connection.release();
  }
});

// 📌 게시물 조회 API (GET /api/groups/:groupId/posts)
router.get('/:groupId/posts', async (req, res) => {
  const { groupId } = req.params;
  const { page = 1, pageSize = 8, sortBy = 'latest', keyword, isPublic } = req.query;

  // 페이지네이션 값 변환
  const limit = parseInt(pageSize, 10);
  const offset = (parseInt(page, 10) - 1) * limit;

  // 정렬 기준 설정
  let orderByClause;
  switch (sortBy) {
    case 'mostCommented':
      orderByClause = 'ORDER BY p.commentCount DESC';
      break;
    case 'mostLiked':
      orderByClause = 'ORDER BY p.likeCount DESC';
      break;
    case 'latest':
    default:
      orderByClause = 'ORDER BY p.createdAt DESC';
  }

  try {
    const connection = await pool.getConnection();

    // 검색어 적용 (제목, 내용, 태그에서 검색)
    let whereClause = `WHERE p.groupId = ?`;
    const queryParams = [groupId];

    if (isPublic !== undefined) {
      whereClause += ` AND p.isPublic = ?`;
      queryParams.push(isPublic === 'true');
    }

    if (keyword) {
      whereClause += ` AND (p.title LIKE ? OR p.content LIKE ? OR t.tagName LIKE ?)`;
      queryParams.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    //  총 게시물 수 조회 (페이지네이션 계산용)
    const [totalResult] = await connection.query(
      `SELECT COUNT(DISTINCT p.postId) as total FROM posts p
       LEFT JOIN post_tags pt ON p.postId = pt.postId
       LEFT JOIN tags t ON pt.tagId = t.tagId
       ${whereClause}`, queryParams
    );

    const totalItemCount = totalResult[0].total;
    const totalPages = Math.ceil(totalItemCount / limit);

    // 🔹 게시물 목록 조회
    const [posts] = await connection.query(
      `SELECT DISTINCT p.postId, p.nickname, p.title, p.imageUrl, p.location, p.moment, p.isPublic, 
              p.likeCount, p.commentCount, p.createdAt, 
              GROUP_CONCAT(DISTINCT t.tagName) AS tags
       FROM posts p
       LEFT JOIN post_tags pt ON p.postId = pt.postId
       LEFT JOIN tags t ON pt.tagId = t.tagId
       ${whereClause}
       GROUP BY p.postId
       ${orderByClause}
       LIMIT ? OFFSET ?`, [...queryParams, limit, offset]
    );

    connection.release();

    res.json({
      currentPage: parseInt(page, 10),
      totalPages,
      totalItemCount,
      data: posts.map(post => ({
        ...post,
        tags: post.tags ? post.tags.split(',') : []
      }))
    });

  } catch (error) {
    console.error('❌ 게시물 조회 오류:', error);
    res.status(500).json({ error: '서버 오류로 게시물을 가져올 수 없습니다.' });
  }
});

export default router;

