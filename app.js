import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import "./config/batchScheduler.js"; // 배치 스케줄러
import prisma from "./config/prismaClient.js";
import postRoutes from "./routes/postRoute.js";
import groupRouter from "./routes/groupRoute.js";
import commentRoutes from "./routes/commentRoute.js"
import imageRouter from './routes/imageRoute.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', imageRouter);
app.use("/api", groupRouter);
app.use("/", postRoutes);
app.use(commentRoutes);

const PORT = process.env.PORT || 5000;

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Prisma 종료 시 처리
process.on("SIGINT", async () => {
  console.log("Disconnecting Prisma...");
  await prisma.$disconnect();
  process.exit(0);
});
