/*
  Warnings:

  - You are about to drop the column `rawInputText` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `rawTranscript` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `soapNote` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `sourceType` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the `PatientSnapshot` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `content` to the `Note` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Note` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NoteType" AS ENUM ('SOAP', 'TEXT', 'AUDIO');

-- CreateEnum
CREATE TYPE "NoteStatus" AS ENUM ('DRAFT', 'FINAL');

-- DropForeignKey
ALTER TABLE "PatientSnapshot" DROP CONSTRAINT "PatientSnapshot_patientId_fkey";

-- AlterTable
ALTER TABLE "Note" DROP COLUMN "rawInputText",
DROP COLUMN "rawTranscript",
DROP COLUMN "soapNote",
DROP COLUMN "sourceType",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "status" "NoteStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "type" "NoteType" NOT NULL;

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "allergies" TEXT[],
ADD COLUMN     "diagnoses" TEXT[],
ADD COLUMN     "medications" TEXT[],
ALTER COLUMN "sex" DROP DEFAULT;

-- DropTable
DROP TABLE "PatientSnapshot";
