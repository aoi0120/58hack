/*
  Warnings:

  - You are about to drop the column `level` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "level",
ADD COLUMN     "lose_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "win_count" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."URL" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "URL_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_FoundUsers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_FoundUsers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "URL_id_key" ON "public"."URL"("id");

-- CreateIndex
CREATE INDEX "_FoundUsers_B_index" ON "public"."_FoundUsers"("B");

-- AddForeignKey
ALTER TABLE "public"."_FoundUsers" ADD CONSTRAINT "_FoundUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_FoundUsers" ADD CONSTRAINT "_FoundUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
