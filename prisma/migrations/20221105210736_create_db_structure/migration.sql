/*
  Warnings:

  - You are about to drop the column `created_at` on the `Participants` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Guesses` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Participants" (
    "user_id" TEXT NOT NULL,
    "pool_id" TEXT NOT NULL,
    "id" TEXT NOT NULL PRIMARY KEY,
    CONSTRAINT "Participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Participants_pool_id_fkey" FOREIGN KEY ("pool_id") REFERENCES "Pools" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Participants" ("id", "pool_id", "user_id") SELECT "id", "pool_id", "user_id" FROM "Participants";
DROP TABLE "Participants";
ALTER TABLE "new_Participants" RENAME TO "Participants";
CREATE UNIQUE INDEX "Participants_user_id_pool_id_key" ON "Participants"("user_id", "pool_id");
CREATE TABLE "new_Guesses" (
    "game_id" TEXT NOT NULL,
    "participant_id" TEXT NOT NULL,
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstTeamPoints" INTEGER NOT NULL,
    "secondTeamPoints" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Guesses_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "Participants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Guesses_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Games" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Guesses" ("created_at", "firstTeamPoints", "game_id", "id", "participant_id", "secondTeamPoints") SELECT "created_at", "firstTeamPoints", "game_id", "id", "participant_id", "secondTeamPoints" FROM "Guesses";
DROP TABLE "Guesses";
ALTER TABLE "new_Guesses" RENAME TO "Guesses";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
