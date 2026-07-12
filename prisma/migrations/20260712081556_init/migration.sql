/*
  Warnings:

  - You are about to alter the column `login` on the `Users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to alter the column `password` on the `Users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(43)`.
  - Made the column `password` on table `Users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "score" SMALLINT NOT NULL DEFAULT 0,
ALTER COLUMN "login" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "password" SET NOT NULL,
ALTER COLUMN "password" SET DATA TYPE VARCHAR(43);
