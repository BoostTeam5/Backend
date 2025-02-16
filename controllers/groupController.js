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
    //console.log("원본 비밀번호:", password);

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    //console.log("해싱된 비밀번호:", hashedPassword);

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

//그룹 조회
const getGroups = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const sortBy = req.query.sortBy || "latest";
    const keyword = req.query.keyword || "";
    const isPublic = req.query.isPublic !== undefined ? req.query.isPublic === "true" : null;

    const { totalItemCount, groups } = await Group.getGroupsFromDB({
      page,
      pageSize,
      sortBy,
      keyword,
      isPublic,
    });

    const totalPages = Math.ceil(totalItemCount / pageSize);
    if (totalItemCount === 0) {
      return res.status(200).json({
        currentPage: page,
        totalPages: 0,
        totalItemCount: 0,
        data: [],
      });
    }

    res.status(200).json({
      currentPage: page,
      totalPages: totalPages,
      totalItemCount: totalItemCount,
      data: groups.map((group) => ({
        id: group.groupId,
        name: group.name,
        introduction: group.introduction,
        imageUrl: group.imageUrl,
        isPublic: group.isPublic,
        likeCount: group.likeCount,
        postCount: group.postCount,
        badgeCount: group.badgeCount,
        createdAt: group.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export { createGroup, getGroups };