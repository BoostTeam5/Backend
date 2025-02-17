<<<<<<< HEAD
<<<<<<< HEAD
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
=======

import prisma from "../config/prismaClient.js";

>>>>>>> feature/5-realGroupView
=======

import prisma from "../config/prismaClient.js";

>>>>>>> feature/5-realGroupView

const Group = {
  createGroup: async (data) => {
    return await prisma.groups.create({ data });
  },
<<<<<<< HEAD
<<<<<<< HEAD
  
=======

>>>>>>> feature/5-realGroupView
=======

>>>>>>> feature/5-realGroupView
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
<<<<<<< HEAD
<<<<<<< HEAD
    

    // findMany()에서만 mode: "insensitive" 
    let findManyWhereCondition = {
      AND: whereCondition.AND.map((condition) => {
        if (condition.name) {
          return { name: { contains: keyword.toLowerCase(), } };
       }
       return condition;
     }),
   };

=======
=======
>>>>>>> feature/5-realGroupView

    let findManyWhereCondition = {
      AND: whereCondition.AND.map((condition) => {
        if (condition.name) {
          return { name: { contains: keyword.toLowerCase() } };
        }
        return condition;
      }),
    };
<<<<<<< HEAD
>>>>>>> feature/5-realGroupView
=======
>>>>>>> feature/5-realGroupView

    const groups = await prisma.groups.findMany({
      where: findManyWhereCondition,
      orderBy: orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { totalItemCount, groups };
  },

<<<<<<< HEAD
<<<<<<< HEAD

=======
>>>>>>> feature/5-realGroupView
=======
>>>>>>> feature/5-realGroupView
  //특정 그룹 수정
  updateGroupById: async (groupId, password, data) => {
    const group = await prisma.groups.findUnique({
      where: { groupId: Number(groupId) },
<<<<<<< HEAD
<<<<<<< HEAD
      select: { groupPassword: true },
    });

    if (!group) {
      throw new Error("존재하지 않습니다");
=======
=======
>>>>>>> feature/5-realGroupView
      select: { groupPassword: true }, // 🔹 비밀번호만 가져옴
    });

    if (!group) {
      throw new Error("존재하지 않는 그룹입니다.");
<<<<<<< HEAD
>>>>>>> feature/5-realGroupView
=======
>>>>>>> feature/5-realGroupView
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

<<<<<<< HEAD
<<<<<<< HEAD

  //그룹 삭제
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

    //비밀번호가 맞으면 그룹 삭제
    await prisma.groups.delete({
      where: { groupId: Number(groupId) },
    });

    return { message: "그룹 삭제 성공" };
  },
};

=======
=======
>>>>>>> feature/5-realGroupView
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
<<<<<<< HEAD
>>>>>>> feature/5-realGroupView
=======
>>>>>>> feature/5-realGroupView
export default Group;
