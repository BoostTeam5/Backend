-- CreateTable
CREATE TABLE `post_tags` (
    `postId` INTEGER NOT NULL,
    `tagId` INTEGER NOT NULL,

    INDEX `tagId`(`tagId`),
    PRIMARY KEY (`postId`, `tagId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `posts` (
    `postId` INTEGER NOT NULL AUTO_INCREMENT,
    `groupId` INTEGER NOT NULL,
    `nickname` VARCHAR(255) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `imageUrl` VARCHAR(500) NULL,
    `content` TEXT NOT NULL,
    `location` VARCHAR(255) NULL,
    `moment` DATE NULL,
    `isPublic` BOOLEAN NULL DEFAULT true,
    `postPassword` VARCHAR(255) NULL,
    `likeCount` INTEGER NULL DEFAULT 0,
    `commentCount` INTEGER NULL DEFAULT 0,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `groupId`(`groupId`),
    PRIMARY KEY (`postId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tags` (
    `tagId` INTEGER NOT NULL AUTO_INCREMENT,
    `tagName` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `tagName`(`tagName`),
    PRIMARY KEY (`tagId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teams` (
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
ALTER TABLE `post_tags` ADD CONSTRAINT `post_tags_ibfk_1` FOREIGN KEY (`postId`) REFERENCES `posts`(`postId`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `post_tags` ADD CONSTRAINT `post_tags_ibfk_2` FOREIGN KEY (`tagId`) REFERENCES `tags`(`tagId`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`groupId`) REFERENCES `teams`(`groupId`) ON DELETE CASCADE ON UPDATE NO ACTION;
