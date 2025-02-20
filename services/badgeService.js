import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Badge 아이디
const BADGE_CONSECUTIVE_DAYS_7 = 1; // "7일 연속 추억 등록"
const BADGE_POST_COUNT_20 = 2; // "추억 수 20개 이상 등록"
const BADGE_GROUP_AGE_1_YEAR = 3; // "그룹 생성 후 1년 달성"
const BADGE_GROUP_LIKE_COUNT_10000 = 4; // "그룹 공감 1만 개 이상 받기"
const BADGE_POST_LIKE_COUNT_10000 = 5; // "추억 공감 1만 개 이상 받기"

const awardBadge = async (groupId, badgeId) => {
  try {
    await prisma.groupBadge.create({
      data: { groupId, badgeId },
    });
    console.log(`그룹 ${groupId}이 배지 ${badgeId}를 받았습니다`);
  } catch (error) {
    if (error.code !== "P2002") {
      console.error("배지 부여 중 오류 발생:", error);
    }
  }
};


const checkConsecutiveDays = async (groupId) => {
  const currentDate = new Date();
  const startDate = new Date(currentDate);
  startDate.setDate(currentDate.getDate() - 6);

  const posts = await prisma.posts.groupBy({
    by: ["createdAt"],
    where: {
      groupId,
      createdAt: {
        gte: startDate,
        lte: currentDate,
      },
    },
    _count: {
      createdAt: true,
    },
  });

  const consecutiveDaysCount = posts.filter((posts) => {
    return posts.createdAt.toISOString().split("T")[0]; // 날짜 형식 비교
  }).length;

  if (consecutiveDaysCount === 7) {
    await awardBadge(groupId, BADGE_CONSECUTIVE_DAYS_7);
  }
};

const checkPostCount = async (groupId) => {
  const postCount = await prisma.posts.count({
    where: { groupId },
  });

  if (postCount >= 20) {
    await awardBadge(groupId, BADGE_POST_COUNT_20);
  }
};

const checkGroupAge = async (groupId) => {
  const group = await prisma.groups.findUnique({
    where: { groupId },
    select: { createdAt: true },
  });

  if (!group) {
    console.error(`그룹 ${groupId}을 찾을 수 없습니다`);
    return;
  }

  const currentDate = new Date();
  const createdAt = new Date(group.createdAt);
  const oneYearLater = new Date(createdAt);
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

  if (currentDate >= oneYearLater) {
    await awardBadge(groupId, BADGE_GROUP_AGE_1_YEAR);
  }
};

const checkGroupLikeCount = async (groupId) => {
  const group = await prisma.groups.findUnique({
    where: { groupId },
    select: { likeCount: true },
  });

  if (group.likeCount >= 10000) {
    await awardBadge(groupId, BADGE_GROUP_LIKE_COUNT_10000);
  }
};

const checkPostLikeCount = async (postId) => {
  const parsedPostId = parseInt(postId,10);
  const post = await prisma.posts.findUnique({
    where: { postId:parsedPostId },
    select: { groupId: true, likeCount: true },
  });

  const existingBadge = await prisma.groupBadge.findFirst({
    where: { groupId: post.groupId, badgeId: BADGE_POST_LIKE_COUNT_10000 },
  });
  if (existingBadge) {
    //console.log(`이미 배지 5번을 받음`);
    return; 
  }

  if (post.likeCount >= 12) {
    await awardBadge(post.groupId, BADGE_POST_LIKE_COUNT_10000);
  }
};

export {
  checkConsecutiveDays,
  checkPostCount,
  checkGroupAge,
  checkGroupLikeCount,
  checkPostLikeCount,
};
