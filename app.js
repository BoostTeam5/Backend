import express from "express";
import groupRouter from "./routes/groupRoute.js";


const app = express();
app.use(express.json());

// 라우터 설정
app.use("/api", groupRouter);

// 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});