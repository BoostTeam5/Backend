import { uploadFileToS3 } from "../services/imageService.js";

export const uploadImage = async (req, res) => {
  try {
    const { type } = req.params;
    if (!["groups", "posts"].includes(type)) {
      return res.status(400).json({ message: "잘못된 업로드 유형입니다." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "파일이 업로드되지 않았습니다." });
    }

    const imageUrl = await uploadFileToS3(req.file, type);
    res.status(200).json({ imageUrl });

  } catch (error) {
    console.error("업로드 오류:", error);
    res.status(500).json({ message: "이미지 업로드에 실패했습니다." });
  }
};
