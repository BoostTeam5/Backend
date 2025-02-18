import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import prisma from './config/prismaClient.js';
import postsRouter from './routes/posts.js';
import imageRouter from './routes/imageRoute.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 기본 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use('/api', postsRouter);
app.use('/api', imageRouter);

//기본 라우트 
app.get('/', (req, res) => {
  res.send('Server is running!');
});

process.on('SIGINT', async () => {
  console.log('Disconnecting Prisma...');
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });