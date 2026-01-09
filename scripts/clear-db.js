
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Cleaning database...');
    try {
        const deletedNotes = await prisma.note.deleteMany({});
        console.log(`Deleted ${deletedNotes.count} notes.`);

        const deletedPatients = await prisma.patient.deleteMany({});
        console.log(`Deleted ${deletedPatients.count} patients.`);

        console.log('Database cleaned successfully.');
    } catch (error) {
        console.error('Error cleaning database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
