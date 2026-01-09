export interface LogEntry {
    message: string;
    ts: number;
}

export interface SeedProgress {
    current: number;
    total: number;
}

import { Note, Patient, MedicalEntity } from '@prisma/client';

export type NoteWithPatient = Note & {
    patient: Patient;
};

export type NoteDetail = Note & {
    patient: Patient;
    medicalEntities: MedicalEntity[];
};
