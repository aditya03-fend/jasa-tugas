-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "namaMhs" TEXT NOT NULL,
    "nim" TEXT NOT NULL,
    "universitas" TEXT NOT NULL,
    "prodi" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "taskLink" TEXT NOT NULL,
    "ssoUsername" TEXT,
    "ssoPassword" TEXT,
    "mataKuliah" TEXT NOT NULL,
    "judulTugas" TEXT NOT NULL,
    "instruksi" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "price" INTEGER NOT NULL DEFAULT 10000,
    "paymentProof" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
