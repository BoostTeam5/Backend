/*
  Warnings:

  - You are about to drop the `teams` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `posts` DROP FOREIGN KEY `posts_ibfk_1`;

-- DropTable
DROP TABLE `teams`;

-- CreateTable
CREATE TABLE `groups` (
    `groupId` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `imageUrl` VARCHAR(500) NULL,
    `introduction` TEXT NULL,
    `isPublic` BOOLEAN NULL DEFAULT true,
    `groupPassword` VARCHAR(255) NULL,
    `badgeCount` INTEGER NULL DEFAULT 0,
    `postCount` INTEGER NULL DEFAULT 0,
    `likeCount` INTEGER NULL DEFAULT 0,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`groupId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`groupId`) REFERENCES `groups`(`groupId`) ON DELETE CASCADE ON UPDATE NO ACTION;
