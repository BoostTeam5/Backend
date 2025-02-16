/*
  Warnings:

  - Made the column `groupPassword` on table `groups` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `groups` MODIFY `groupPassword` VARCHAR(255) NOT NULL;
