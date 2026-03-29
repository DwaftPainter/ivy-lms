/*
  Warnings:

  - You are about to drop the column `classSessionId` on the `assignments` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "assignments" DROP CONSTRAINT "assignments_classSessionId_fkey";

-- AlterTable
ALTER TABLE "assignments" DROP COLUMN "classSessionId";
