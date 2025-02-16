import bcrypt from "bcrypt";
import Group from "../models/groupModel.js";

//그룹 등록
const createGroup = async (req, res) => {
  try {
    const { name, password, imageUrl, isPublic, introduction } = req.body;

    // 필수 값 체크
    if (!name || !password) {
      return res.status(400).json({ message: "잘못된 요청입니다" });
    }
    console.log("🔹 원본 비밀번호:", password);

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    console.log("🔐 해싱된 비밀번호:", hashedPassword);

    const newGroup = await Group.createGroup({
      name,
      groupPassword: hashedPassword,
      imageUrl: imageUrl || null,
      isPublic: isPublic ?? true,
      introduction: introduction || null,
      likeCount: 0,
      postCount: 0,
      badgeCount: 0,
    });
    console.log("✅ Prisma에 저장될 데이터:", newGroup);

    res.status(201).json({
      id: newGroup.groupId,
      name: newGroup.name,
      introduction: newGroup.introduction,
      imageUrl: newGroup.imageUrl,
      isPublic: newGroup.isPublic,
      likeCount: newGroup.likeCount,
      postCount: newGroup.postCount,
      badges: [],
      createdAt: newGroup.createdAt,
    });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default createGroup;