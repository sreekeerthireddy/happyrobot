-- CreateTable
CREATE TABLE "Load" (
    "load_id" TEXT NOT NULL PRIMARY KEY,
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

-- CreateIndex
CREATE INDEX "idx_load_match" ON "Load"("origin", "destination", "pickup_datetime", "equipment_type");
