import { uploadFileToS3 } from "../services/imageService.js";

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "파일이 업로드되지 않았습니다." });
    }

    const { type } = req.params; // URL 파라미터에서 type 가져오기
    const folder = type === "posts" || type === "groups" ? type : "uploads"; // 기본 uploads 폴더

    const fileKey = await uploadFileToS3(req.file, req.file.mimetype, folder);
    const imageUrl = `${process.env.AWS_CLOUD_FRONT_URL}/${fileKey}`;

    res.status(200).json({ imageUrl });

  } catch (error) {
    console.error("업로드 오류:", error);
    res.status(500).json({ message: "이미지 업로드에 실패했습니다." });
  }
};
