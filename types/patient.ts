import { Sex } from '@prisma/client';

export type PatientSeedData = {
    mrn: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    sex: Sex;
    phone: string | undefined;
    email: string | undefined;
    addressLine1: string | undefined;
    city: string;
    state: string;
    postalCode: string;
    allergies: string[];
    medications: string[];
    diagnoses: string[];
    avatarUrl?: string;
};
