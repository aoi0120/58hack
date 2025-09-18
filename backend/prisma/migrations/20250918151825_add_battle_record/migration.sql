/*
  Warnings:

  - You are about to drop the column `lose_count` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `win_count` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "lose_count",
DROP COLUMN "win_count";

-- CreateTable
CREATE TABLE "public"."BattleRecord" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "winnerId" INTEGER NOT NULL,
    "loserId" INTEGER NOT NULL,

    CONSTRAINT "BattleRecord_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."BattleRecord" ADD CONSTRAINT "BattleRecord_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BattleRecord" ADD CONSTRAINT "BattleRecord_loserId_fkey" FOREIGN KEY ("loserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
