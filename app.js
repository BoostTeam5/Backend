import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import prisma from "./config/prismaClient.js";
import postRoutes from "./routes/postRoute.js";
import groupRouter from "./routes/groupRoute.js";
import commentRoutes from "./routes/commentRoute.js"

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// 라우터 설정
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
