import { Router } from "express";
import { imageUploader } from "../config/awsS3config.js";
import { uploadImage } from "../controllers/imageController.js";

const router = Router();

// ✅ 업로드 API (POST /api/image/:type)
router.post("/:type", imageUploader.single("image"), uploadImage);

export default router;
