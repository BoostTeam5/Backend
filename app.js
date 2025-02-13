import express from 'express';
import dotenv from 'dotenv';
import pool from './config/db.js';
import groupRoutes from './routes/groups.js';
import postRoutes from './routes/posts.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 기본 미들웨어 설정
app.use(express.json());
app.use('/api/groups', groupRoutes);
app.use('/api/posts', postRoutes);

// 간단한 헬스 체크 라우트 추가
app.get('/', (req, res) => {
    res.status(200).send('Hello express');
  });

app.listen(PORT, () => {
    console.log(`🚀 Server started on port ${PORT}`);
  });