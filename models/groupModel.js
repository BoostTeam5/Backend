import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const Group = {
  createGroup: async (data) => {
    return await prisma.groups.create({ data });
  },getGroupsFromDB: async ({ page, pageSize, sortBy, keyword, isPublic }) => {
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

    //const whereCondition = {
    //  AND: [
    //    keyword ? { name: { contains: keyword, mode: "insensitive" } } : {},
    //   isPublic !== null ? { isPublic } : {},
    //  ],
    //};
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
    

    // ✅ findMany()에서는 mode: "insensitive" 유지 가능
    if (keyword) {
     whereCondition.AND = whereCondition.AND.map((condition) => {
       if (condition.name) {
          return { name: { contains: keyword, mode: "insensitive" } };
        }
        return condition;
     });
    }


    const groups = await prisma.groups.findMany({
      where: whereCondition,
      orderBy: orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { totalItemCount, groups };
  },
};

export default Group;
