/*
  Warnings:

  - You are about to drop the column `lastOfferRate` on the `Negotiation` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Negotiation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loadId" TEXT NOT NULL,
    "mcNumber" TEXT NOT NULL,
    "currentRound" INTEGER NOT NULL DEFAULT 0,
    "carrierLastProposed" REAL,
    "serverLastProposed" REAL,
    "agreedRate" REAL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Negotiation_loadId_fkey" FOREIGN KEY ("loadId") REFERENCES "Load" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Negotiation" ("createdAt", "currentRound", "id", "loadId", "mcNumber", "status", "updatedAt") SELECT "createdAt", "currentRound", "id", "loadId", "mcNumber", "status", "updatedAt" FROM "Negotiation";
DROP TABLE "Negotiation";
ALTER TABLE "new_Negotiation" RENAME TO "Negotiation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
