import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const Group = {
  createGroup: async (data) => {
    return await prisma.groups.create({ data });
  },
};

export default Group;
