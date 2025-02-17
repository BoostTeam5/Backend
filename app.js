import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import prisma from "./config/prismaClient.js";
import postRoutes from "./routes/postRoute.js";
import groupRouter from "./routes/groupRoute.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// 라우터 설정
app.use("/api", groupRouter);

app.use("/", postRoutes);
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on("SIGINT", async () => {
  console.log("Disconnecting Prisma...");
  await prisma.$disconnect();
  process.exit(0);
});

