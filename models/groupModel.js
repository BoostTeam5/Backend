import prisma from "../config/prismaClient.js";
import bcrypt from "bcrypt";

const Group = {
  createGroup: async (data) => {
    return await prisma.groups.create({ data });
  },

  // 그룹 조회, 페이징 및 필터링
  getGroupsFromDB: async ({ page, pageSize, sortBy, keyword, isPublic }) => {
    let orderBy = {};
    switch (sortBy) {
      case "latest":
        orderBy = { createdAt: "desc" };
        break;
      case "mostPosted":
        orderBy = { postCount: "desc" };
        break;
      case "mostLiked":
        orderBy = { likeCount: "desc" };
        break;
      case "mostBadge":
        orderBy = { badgeCount: "desc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    let whereCondition = { AND: [] };

    if (keyword) {
      whereCondition.AND.push({
        name: { contains: keyword },
      });
    }

    if (isPublic !== null) {
      whereCondition.AND.push({ isPublic });
    }

    const totalItemCount = await prisma.groups.count({ where: whereCondition });

    if (totalItemCount === 0) {
      return { totalItemCount: 0, groups: [] };
    }

    const findManyWhereCondition = {
      AND: whereCondition.AND.map((condition) =>
        condition.name ? { name: { contains: keyword.toLowerCase() } } : condition
      ),
    };

    const groups = await prisma.groups.findMany({
      where: findManyWhereCondition,
      orderBy: orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { totalItemCount, groups };
  },

  // 특정 그룹 수정
  updateGroupById: async (groupId, password, data) => {
    const group = await prisma.groups.findUnique({
      where: { groupId: Number(groupId) },
      select: { groupPassword: true },
    });

    if (!group) {
      throw new Error("존재하지 않습니다");
    }

    const isPasswordCorrect = await bcrypt.compare(password, group.groupPassword);
    if (!isPasswordCorrect) {
      throw new Error("비밀번호가 틀렸습니다");
    }

    return await prisma.groups.update({
      where: { groupId: Number(groupId) },
      data,
    });
  },

  // 그룹 삭제
  deleteGroupById: async (groupId, password) => {
    const group = await prisma.groups.findUnique({
      where: { groupId: Number(groupId) },
      select: { groupPassword: true },
    });

    if (!group) {
      throw new Error("존재하지 않습니다");
    }

    const isPasswordCorrect = await bcrypt.compare(password, group.groupPassword);
    if (!isPasswordCorrect) {
      throw new Error("비밀번호가 틀렸습니다");
    }

    await prisma.groups.delete({
      where: { groupId: Number(groupId) },
    });

    return { message: "그룹 삭제 성공" };
  },

  // 그룹 상세 조회
  getGroupById: async (groupId) => {
    return await prisma.groups.findUnique({
      where: { groupId: Number(groupId) },
    });
  },

  // 그룹 공감하기 (likeCount 증가)
  likeGroupById: async (groupId) => {
    const existingGroup = await prisma.groups.findUnique({
      where: { groupId: Number(groupId) },
    });

    if (!existingGroup) {
      return null;
    }

    return await prisma.groups.update({
      where: { groupId: Number(groupId) },
      data: {
        likeCount: existingGroup.likeCount + 1,
      },
    });
  },
};

export default Group;
