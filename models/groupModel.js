import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const Group = {
  createGroup: async (data) => {
    return await prisma.groups.create({ data });
  },

  //그룹 조회, 페이징 및 필터링
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

    let whereCondition = {
      AND: [],
    };
  
    if (keyword) {
      whereCondition.AND.push({
        name: { contains: keyword }, // count()에서는 mode: "insensitive" 사용 X
      });
    }
  
    if (isPublic !== null) {
      whereCondition.AND.push({ isPublic });
    }

    const totalItemCount = await prisma.groups.count({ where: whereCondition });

    if (totalItemCount === 0) {
      return { totalItemCount: 0, groups: [] };
    }

    let findManyWhereCondition = {
      AND: whereCondition.AND.map((condition) => {
        if (condition.name) {
          return { name: { contains: keyword.toLowerCase(), } };
       }
       return condition;
     }),
   };

    const groups = await prisma.groups.findMany({
      where: findManyWhereCondition,
      orderBy: orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { totalItemCount, groups };
  },

  //특정 그룹 수정
  updateGroupById: async (groupId, password, data) => {
    const group = await prisma.groups.findUnique({
      where: { groupId: Number(groupId) },
      select: { groupPassword: true }, // 🔹 비밀번호만 가져옴
    });

    if (!group) {
      throw new Error("존재하지 않는 그룹입니다.");
    }

    //비밀번호 검증
    const isPasswordCorrect = await bcrypt.compare(password, group.groupPassword);
    if (!isPasswordCorrect) {
      throw new Error("비밀번호가 틀렸습니다");
    }

    //비밀번호 같다면 그룹 수정
    return await prisma.groups.update({
      where: { groupId: Number(groupId) },
      data,
    });
  },

  // 그룹 상세 조회
  getGroupById: async (groupId) => {
    return await prisma.groups.findUnique({
      where: { groupId: Number(groupId) },  // groupId 사용
    });
  },

};




export default Group;
