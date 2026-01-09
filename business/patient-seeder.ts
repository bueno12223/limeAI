import { faker } from '@faker-js/faker';
import { Sex } from '@prisma/client';
import { PatientSeedData } from '@/types/patient';

export const SEX_MAPPING: Record<string, Sex> = {
    'MALE': Sex.MALE,
    'FEMALE': Sex.FEMALE
};

export function generatePatientData(): PatientSeedData {
    const sexStr = faker.person.sex().toUpperCase();
    const sex = SEX_MAPPING[sexStr] || Sex.FEMALE;

    const firstName = faker.person.firstName(sex === Sex.MALE ? 'male' : 'female');
    const lastName = faker.person.lastName();

    return {
        mrn: `MRN-${faker.string.alphanumeric(8).toUpperCase()}`,
        firstName,
        lastName,
        dateOfBirth: faker.date.birthdate({ min: 18, max: 90, mode: 'age' }),
        sex: sex,
        phone: faker.helpers.maybe(() => faker.phone.number(), { probability: 0.8 }),
        email: faker.helpers.maybe(() => faker.internet.email({ firstName, lastName }), { probability: 0.7 }),
        addressLine1: faker.helpers.maybe(() => faker.location.streetAddress(), { probability: 0.9 }),
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        postalCode: faker.location.zipCode(),
        allergies: faker.helpers.arrayElements(['Penicillin', 'Peanuts', 'Latex', 'Sulfa', 'Amoxicillin'], { min: 0, max: 2 }),
        medications: faker.helpers.arrayElements(['Lisinopril', 'Metformin', 'Simvastatin', 'Omeprazole', 'Amlodipine'], { min: 0, max: 3 }),
        diagnoses: faker.helpers.arrayElements(['Hypertension', 'Type 2 Diabetes', 'Hyperlipidemia', 'GERD', 'Asthma'], { min: 0, max: 3 }),
        avatarUrl: faker.image.avatar(),
    };
}

export function generatePatients(count: number): PatientSeedData[] {
    return Array.from({ length: count }).map(() => generatePatientData());
}
