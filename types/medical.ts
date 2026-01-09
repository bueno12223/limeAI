import { EntityType } from "@prisma/client";

export interface MappedEntity {
    text: string;
    category: EntityType;
    score: number;
    dosage: string | null;
    frequency: string | null;
}

export interface SOAPData {
    subjective: string;
    objective: string | null;
    assessment: string;
    plan: string;
}
