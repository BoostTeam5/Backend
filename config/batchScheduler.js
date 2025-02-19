import cron from "node-cron";
import { checkGroupAge } from "../services/badgeService.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 매일 자정에 모든 그룹의 배지를 검사
cron.schedule("0 0 * * *", async () => {
  console.log("모든 그룹의 1년 경과 여부를 검사합니다");

  try {
    const allGroups = await prisma.groups.findMany({
      select: { groupId: true, createdAt: true },
    });

    //3번 배지 조건 확인
    for (const group of allGroups) {
      await checkGroupAge(group.groupId);
    }

    console.log(" 모든 그룹의 배지 체크 완료!");
  } catch (error) {
    console.error("배지 스케줄러 오류 발생:", error);
  }
});
