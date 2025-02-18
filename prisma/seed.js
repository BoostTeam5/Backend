import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Badges 데이터 추가
  const badgesData = [
    { id: 1, name: "7일 연속 추억 등록" },
    { id: 2, name: "추억 수 20개 이상 등록" },
    { id: 3, name: "그룹 생성 후 1년 달성" },
    { id: 4, name: "그룹 공감 1만 개 이상 받기" },
    { id: 5, name: "추억 공감 1만 개 이상 받기" },
  ];

  for (const badge of badgesData) {
    await prisma.badge.upsert({
      where: { id: badge.id },
      update: {},
      create: badge,
    });
  }

  console.log("Badge 데이터가 성공적으로 추가되었습니다.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
