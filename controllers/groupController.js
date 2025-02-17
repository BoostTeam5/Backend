import bcrypt from "bcrypt";
import Group from "../models/groupModel.js";

// 그룹 등록
const createGroup = async (req, res) => {
  try {
    const { name, password, imageUrl, isPublic, introduction } = req.body;

    if (!name || !password) {
      return res.status(400).json({ message: "잘못된 요청입니다" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

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

<<<<<<< HEAD
// 그룹 목록 조회
=======
// 그룹 조회
>>>>>>> feature/5-realGroupView
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
<<<<<<< HEAD
    res.status(200).json({
      currentPage: page,
      totalPages,
      totalItemCount,
=======
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
>>>>>>> feature/5-realGroupView
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

<<<<<<< HEAD
// 그룹 상세 조회
const getGroupDetails = async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId, 10);

    if (!groupId) {
      return res.status(400).json({ message: "잘못된 요청입니다" });
    }

    const group = await Group.getGroupById(groupId);

    if (!group) {
      return res.status(404).json({ message: "그룹을 찾을 수 없습니다" });
    }

    res.status(200).json({
      id: group.groupId,
      name: group.name,
      imageUrl: group.imageUrl,
      isPublic: group.isPublic,
      likeCount: group.likeCount,
      badges: [],
      postCount: group.postCount,
      createdAt: group.createdAt,
      introduction: group.introduction,
    });
  } catch (error) {
    console.error("Error fetching group by ID:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

=======
>>>>>>> feature/5-realGroupView
// 그룹 수정
const updateGroup = async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId, 10);
    const { name, password, imageUrl, isPublic, introduction } = req.body;

    if (!password) {
      return res.status(400).json({ message: "잘못된 요청입니다" });
    }

    try {
      const updatedGroup = await Group.updateGroupById(groupId, password, {
        name: name ?? undefined,
        imageUrl: imageUrl ?? undefined,
        isPublic: isPublic ?? undefined,
        introduction: introduction ?? undefined,
      });

      res.status(200).json({
        id: updatedGroup.groupId,
        name: updatedGroup.name,
        imageUrl: updatedGroup.imageUrl,
        isPublic: updatedGroup.isPublic,
        likeCount: updatedGroup.likeCount,
        badges: [],
        postCount: updatedGroup.postCount,
        createdAt: updatedGroup.createdAt,
        introduction: updatedGroup.introduction,
      });
    } catch (error) {
      if (error.message === "비밀번호가 틀렸습니다") {
        return res.status(403).json({ message: error.message });
      }
      if (error.message === "존재하지 않습니다") {
        return res.status(404).json({ message: error.message });
      }
      throw error;
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

<<<<<<< HEAD
// 그룹 삭제
const deleteGroup = async (req, res) => {
=======
// 그룹 상세 정보 조회 // 특정 그룹 ID로 조회
const getGroupDetails = async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId, 10);

    console.log("groupId:", groupId);  // 확인용 로그

    if (!groupId) {
      return res.status(400).json({ message: "잘못된 요청입니다" });
    }

    const group = await Group.getGroupById(groupId);

    if (!group) {
      return res.status(404).json({ message: "그룹을 찾을 수 없습니다" });
    }

    res.status(200).json({
      id: group.groupId,
      name: group.name,
      imageUrl: group.imageUrl,
      isPublic: group.isPublic,
      likeCount: group.likeCount,
      badges: [], // 배지 목록은 추가 구현 필요
      postCount: group.postCount,
      createdAt: group.createdAt,
      introduction: group.introduction,
    });
  } catch (error) {
    console.error("Error fetching group by ID:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const verifyGroupPassword = async (req, res) => {
>>>>>>> feature/5-realGroupView
  try {
    const groupId = parseInt(req.params.groupId, 10);
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "잘못된 요청입니다" });
    }

<<<<<<< HEAD
    try {
      const result = await Group.deleteGroupById(groupId, password);
      res.status(200).json(result);
    } catch (error) {
      if (error.message === "비밀번호가 틀렸습니다") {
        return res.status(403).json({ message: error.message });
      }
      if (error.message === "존재하지 않습니다") {
        return res.status(404).json({ message: error.message });
      }
      throw error;
    }
  } catch (error) {
=======
    // 그룹 정보 가져오기 (비밀번호 포함)
    const group = await Group.getGroupById(groupId);

    if (!group) {
      return res.status(404).json({ message: "그룹을 찾을 수 없습니다" });
    }

    console.log("입력한 비밀번호:", `"${password}"`);
    console.log("DB에 저장된 비밀번호:", `"${group.groupPassword}"`);

    let isMatch = false;

    try {
      if (group.groupPassword.startsWith("$2b$")) {
        // DB에 저장된 비밀번호가 해시값일 때
        isMatch = await bcrypt.compare(password, group.groupPassword);
      } else {
        // DB에 저장된 비밀번호가 일반 문자열일 때
        isMatch = password === group.groupPassword;
      }
    } catch (err) {
      console.error("비밀번호 검증 오류:", err);
      return res.status(500).json({ message: "비밀번호 검증 중 오류 발생" });
    }

    console.log("비밀번호 일치 여부:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: "비밀번호가 틀렸습니다" });
    }

    res.status(200).json({ message: "비밀번호가 확인되었습니다" });
  } catch (error) {
    console.error("Error verifying group password:", error);
>>>>>>> feature/5-realGroupView
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 그룹 공개 여부 확인
const checkGroupPublicStatus = async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId, 10);
<<<<<<< HEAD
=======

    if (!groupId) {
      return res.status(400).json({ message: "잘못된 요청입니다" });
    }

    // 그룹 정보 가져오기
>>>>>>> feature/5-realGroupView
    const group = await Group.getGroupById(groupId);

    if (!group) {
      return res.status(404).json({ message: "그룹을 찾을 수 없습니다" });
    }

<<<<<<< HEAD
    res.status(200).json({ id: group.groupId, isPublic: group.isPublic });
=======
    // 공개 여부 반환
    res.status(200).json({
      id: group.groupId,
      isPublic: group.isPublic,
    });
>>>>>>> feature/5-realGroupView
  } catch (error) {
    console.error("Error checking group public status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 그룹 공감하기
const likeGroup = async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId, 10);
<<<<<<< HEAD
=======

    if (!groupId) {
      return res.status(400).json({ message: "잘못된 요청입니다" });
    }

>>>>>>> feature/5-realGroupView
    const updatedGroup = await Group.likeGroupById(groupId);

    if (!updatedGroup) {
      return res.status(404).json({ message: "존재하지 않습니다" });
    }

    res.status(200).json({ message: "그룹 공감하기 성공" });
  } catch (error) {
    console.error("Error liking group:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

<<<<<<< HEAD
export { createGroup, getGroups, getGroupDetails, updateGroup, deleteGroup, verifyGroupPassword, checkGroupPublicStatus, likeGroup };
=======
export { createGroup, getGroups, updateGroup, getGroupDetails, verifyGroupPassword, checkGroupPublicStatus, likeGroup };
>>>>>>> feature/5-realGroupView
