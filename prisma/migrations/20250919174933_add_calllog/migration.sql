-- CreateTable
CREATE TABLE "CallLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mcNumber" TEXT NOT NULL,
    "loadId" TEXT,
    "outcome" TEXT NOT NULL,
    "sentiment" TEXT NOT NULL,
    "agreedRate" REAL,
    "rounds" INTEGER,
    "transcript" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
