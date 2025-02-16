import express from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import prisma from "./config/prismaClient.js";
dotenv.config();

import postRoutes from "./routes/postRoute.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/posts", postRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

dotenv.config();

process.on("SIGINT", async () => {
  console.log("Disconnecting Prisma...");
  await prisma.$disconnect();
  process.exit(0);
});
