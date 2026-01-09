-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('MEDICATION', 'DIAGNOSIS', 'SYMPTOM', 'TEST', 'PROCEDURE', 'OTHER');

-- AlterEnum
ALTER TYPE "NoteStatus" ADD VALUE 'PROCESSING';

-- CreateTable
CREATE TABLE "MedicalEntity" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "category" "EntityType" NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "dosage" TEXT,
    "frequency" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MedicalEntity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MedicalEntity" ADD CONSTRAINT "MedicalEntity_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;
