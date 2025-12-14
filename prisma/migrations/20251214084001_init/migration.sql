-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SYSTEM_ADMIN', 'KABALE_ADMIN', 'CITIZEN');

-- CreateEnum
CREATE TYPE "IdApplicationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'PENDING_VERIFICATION', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DigitalIdStatus" AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "VerificationResult" AS ENUM ('APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kabale" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kabale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KabaleAdminProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kabaleId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KabaleAdminProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CitizenProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CitizenProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdApplication" (
    "id" TEXT NOT NULL,
    "citizenId" TEXT NOT NULL,
    "kabaleId" TEXT NOT NULL,
    "status" "IdApplicationStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigitalId" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "citizenId" TEXT NOT NULL,
    "status" "DigitalIdStatus" NOT NULL DEFAULT 'ACTIVE',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "revokedBy" TEXT,
    "revokedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DigitalId_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationLog" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "verifiedBy" TEXT NOT NULL,
    "result" "VerificationResult" NOT NULL,
    "notes" TEXT,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Kabale_code_key" ON "Kabale"("code");

-- CreateIndex
CREATE INDEX "Kabale_code_idx" ON "Kabale"("code");

-- CreateIndex
CREATE INDEX "Kabale_name_idx" ON "Kabale"("name");

-- CreateIndex
CREATE UNIQUE INDEX "KabaleAdminProfile_userId_key" ON "KabaleAdminProfile"("userId");

-- CreateIndex
CREATE INDEX "KabaleAdminProfile_kabaleId_idx" ON "KabaleAdminProfile"("kabaleId");

-- CreateIndex
CREATE INDEX "KabaleAdminProfile_userId_idx" ON "KabaleAdminProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CitizenProfile_userId_key" ON "CitizenProfile"("userId");

-- CreateIndex
CREATE INDEX "CitizenProfile_userId_idx" ON "CitizenProfile"("userId");

-- CreateIndex
CREATE INDEX "IdApplication_citizenId_idx" ON "IdApplication"("citizenId");

-- CreateIndex
CREATE INDEX "IdApplication_kabaleId_idx" ON "IdApplication"("kabaleId");

-- CreateIndex
CREATE INDEX "IdApplication_status_idx" ON "IdApplication"("status");

-- CreateIndex
CREATE INDEX "IdApplication_submittedAt_idx" ON "IdApplication"("submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "DigitalId_applicationId_key" ON "DigitalId"("applicationId");

-- CreateIndex
CREATE INDEX "DigitalId_citizenId_idx" ON "DigitalId"("citizenId");

-- CreateIndex
CREATE INDEX "DigitalId_status_idx" ON "DigitalId"("status");

-- CreateIndex
CREATE INDEX "DigitalId_applicationId_idx" ON "DigitalId"("applicationId");

-- CreateIndex
CREATE INDEX "VerificationLog_applicationId_idx" ON "VerificationLog"("applicationId");

-- CreateIndex
CREATE INDEX "VerificationLog_verifiedBy_idx" ON "VerificationLog"("verifiedBy");

-- CreateIndex
CREATE INDEX "VerificationLog_verifiedAt_idx" ON "VerificationLog"("verifiedAt");

-- AddForeignKey
ALTER TABLE "KabaleAdminProfile" ADD CONSTRAINT "KabaleAdminProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KabaleAdminProfile" ADD CONSTRAINT "KabaleAdminProfile_kabaleId_fkey" FOREIGN KEY ("kabaleId") REFERENCES "Kabale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CitizenProfile" ADD CONSTRAINT "CitizenProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdApplication" ADD CONSTRAINT "IdApplication_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "CitizenProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdApplication" ADD CONSTRAINT "IdApplication_kabaleId_fkey" FOREIGN KEY ("kabaleId") REFERENCES "Kabale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalId" ADD CONSTRAINT "DigitalId_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "IdApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalId" ADD CONSTRAINT "DigitalId_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "CitizenProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationLog" ADD CONSTRAINT "VerificationLog_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "IdApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationLog" ADD CONSTRAINT "VerificationLog_verifiedBy_fkey" FOREIGN KEY ("verifiedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
