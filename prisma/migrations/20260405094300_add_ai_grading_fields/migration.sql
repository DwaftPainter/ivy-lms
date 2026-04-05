/*
  Warnings:

  - You are about to drop the column `courseId` on the `assignments` table. All the data in the column will be lost.
  - Added the required column `classSessionId` to the `assignments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "assignments" DROP CONSTRAINT "assignments_courseId_fkey";

-- AlterTable
ALTER TABLE "assignment_submissions" ADD COLUMN     "aiCorrections" JSONB,
ADD COLUMN     "aiFeedback" TEXT,
ADD COLUMN     "aiGradedAt" TIMESTAMP(3),
ADD COLUMN     "aiScore" DOUBLE PRECISION,
ADD COLUMN     "regradeRequestedAt" TIMESTAMP(3),
ADD COLUMN     "teacherRegradeRequested" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "assignments" DROP COLUMN "courseId",
ADD COLUMN     "classSessionId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_classSessionId_fkey" FOREIGN KEY ("classSessionId") REFERENCES "class_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
