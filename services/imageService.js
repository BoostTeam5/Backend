import { s3 } from "../config/awsS3config.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export const uploadFileToS3 = async (file, folder) => {
  if (!file) throw new Error("파일이 없습니다.");

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${folder}/${Date.now()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: "public-read",
  };

  const command = new PutObjectCommand(params);
  await s3.send(command);

  return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${params.Key}`;
};
