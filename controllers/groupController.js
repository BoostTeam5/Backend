import Group from "../models/groupModel.js";

//그룹 등록
const createGroup = async (req, res) => {
  try {
    const { name, password, imageUrl, isPublic, introduction } = req.body;

    // 필수 값 체크
    if (!name) {
      return res.status(400).json({ message: "잘못된 요청입니다" });
    }

    //해싱 추가 필요
    const newGroup = await Group.createGroup({
      name,
      groupPassword: password,
      imageUrl: imageUrl || null,
      isPublic: isPublic ?? true,
      introduction: introduction || null,
      likeCount: 0,
      postCount: 0,
      badgeCount: 0,
    });

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