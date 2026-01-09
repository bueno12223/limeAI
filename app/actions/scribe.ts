"use server";

import { uploadAudioToS3 } from "@/business/storage";
import { transcribeAudio } from "@/business/transcription";
import { process as processMedicalNote, generateStructuredSOAP } from "@/business/medical-notes";
import prisma from "@/lib/prisma";
import { NoteType, NoteStatus } from "@prisma/client";

export async function createNote(formData: FormData) {
    try {
        const patientId = formData.get("patientId") as string;
        const type = formData.get("type") as NoteType;
        const content = formData.get("content") as string | undefined;
        const audioFile = formData.get("audioFile") as File | null;

        if (!patientId || !type) {
            throw new Error("Missing required fields: patientId or type");
        }

        let transcriptText = "";
        let audioKey = "";

        if (type === NoteType.AUDIO) {
            if (!audioFile) {
                throw new Error("Missing audio file for AUDIO note");
            }

            audioKey = await uploadAudioToS3(audioFile);

            transcriptText = await transcribeAudio(audioKey);
        } else if (type === NoteType.TEXT) {
            transcriptText = content || "";
        } else {
            throw new Error("Invalid Note Type");
        }

        const { entities } = await processMedicalNote(transcriptText);

        const soap = await generateStructuredSOAP(transcriptText, entities);

        const note = await prisma.note.create({
            data: {
                patientId,
                type,
                status: NoteStatus.FINAL,
                content: transcriptText,
                audioUrl: audioKey || undefined,
                subjective: soap.subjective,
                objective: soap.objective,
                assessment: soap.assessment,
                plan: soap.plan,
            },
        });

        if (entities.length > 0) {
            await prisma.medicalEntity.createMany({
                data: entities.map((e) => ({
                    noteId: note.id,
                    text: e.text,
                    category: e.category,
                    score: e.score,
                    dosage: e.dosage,
                    frequency: e.frequency,
                })),
            });
        }

        return { success: true, noteId: note.id };

    } catch (error: unknown) {
        console.error("createNote Action Failed:", error);
        let errorMessage = "An unexpected error occurred while creating the note. Please try again.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return { success: false, error: errorMessage };
    }
}
