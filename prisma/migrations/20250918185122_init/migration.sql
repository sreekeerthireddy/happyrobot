/*
  Warnings:

  - The primary key for the `Load` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `load_id` on the `Load` table. All the data in the column will be lost.
  - The required column `id` was added to the `Load` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Load" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "pickup_datetime" DATETIME NOT NULL,
    "delivery_datetime" DATETIME NOT NULL,
    "equipment_type" TEXT NOT NULL,
    "loadboard_rate" REAL NOT NULL,
    "notes" TEXT NOT NULL,
    "weight" REAL NOT NULL,
    "commodity_type" TEXT NOT NULL,
    "num_of_pieces" INTEGER NOT NULL,
    "miles" REAL NOT NULL,
    "dimensions" TEXT NOT NULL
);
INSERT INTO "new_Load" ("commodity_type", "delivery_datetime", "destination", "dimensions", "equipment_type", "loadboard_rate", "miles", "notes", "num_of_pieces", "origin", "pickup_datetime", "weight") SELECT "commodity_type", "delivery_datetime", "destination", "dimensions", "equipment_type", "loadboard_rate", "miles", "notes", "num_of_pieces", "origin", "pickup_datetime", "weight" FROM "Load";
DROP TABLE "Load";
ALTER TABLE "new_Load" RENAME TO "Load";
CREATE INDEX "idx_load_match" ON "Load"("origin", "destination", "pickup_datetime", "equipment_type");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
