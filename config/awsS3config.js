import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// ✅ AWS SDK v3 방식으로 S3 클라이언트 생성
export const s3 = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET_KEY,
  },
});

// ✅ 허용된 이미지 확장자 목록
const allowedExtensions = [".png", ".jpg", ".jpeg", ".bmp", ".gif"];

export const imageUploader = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE, // 자동으로 Content-Type 설정
    acl: "public-read", // 공개 접근 가능하도록 설정
    key: (req, file, callback) => {
      const uploadDirectory = req.params.type || "uploads"; // 기본 폴더 설정
      const fileExtension = path.extname(file.originalname);
      const fileName = `${uploadDirectory}/${uuidv4()}${fileExtension}`; 

      console.log(`📝 S3 업로드 경로: ${fileName}`); 

      callback(null, fileName);
    },
  }),
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한
});
