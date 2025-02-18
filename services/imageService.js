import { S3Client, PutObjectCommand,DeleteObjectCommand } from '@aws-sdk/client-s3';
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import {s3} from "../config/awsS3config.js"

dotenv.config();

export async function uploadFileToS3(file, type, folder = "uploads") {
  try {
    const uniqueFileName = `${uuidv4()}${path.extname(file.originalname)}`;
    const key = `${folder}/${uniqueFileName}`; // 폴더명을 동적으로 설정

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer, // Multer 사용 시 buffer 처리
      ContentType: type,
    });

    await s3.send(command);
    console.log(`S3 업로드 성공 : (${key})`);
    
    return key; // 저장된 S3 URL 반환
  } catch (err) {
    throw new Error(`S3 파일 업로드 실패: ${err.message}`);
  }
}

export async function deleteFileFromS3(fileKey) {
  try {
    console.log(`🗑️ 삭제 요청된 S3 파일: ${fileKey}`);

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileKey,
    });

    await s3.send(command);
    console.log(`✅ S3 파일 삭제 성공! (${fileKey})`);
  } catch (err) {
    console.error(`❌ S3 파일 삭제 실패: ${err.message}`, err);
    throw new Error(`S3 파일 삭제 실패: ${err.message}`);
  }
}