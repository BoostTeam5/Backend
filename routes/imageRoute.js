import { Router } from "express";
import { imageUploader } from "../config/awsS3config.js";
import { uploadImage } from "../controllers/imageController.js";

const router = Router();

// ✅ 업로드 API (POST /api/image)
router.post("/image", imageUploader.single("image"), uploadImage);

//groups, posts 업로드 api
router.post("/image/:type", imageUploader.single("image"), uploadImage);

export default router;
