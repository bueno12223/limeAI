import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generatePatients } from '@/business/patient-seeder';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        let count = parseInt(body.count, 10);

        if (isNaN(count) || count < 1) count = 3;
        if (count > 20) count = 20;

        const patients = generatePatients(count);

        await prisma.patient.createMany({
            data: patients,
            skipDuplicates: true,
        });

        return NextResponse.json({ success: true, count, message: `Seeded ${count} patients` });
    } catch (error: unknown) {
        console.error("Seeding error:", error);
        const errorMessage = error instanceof Error
            ? (error.message.includes('Prisma') ? 'Database operation failed.' : error.message)
            : 'Unknown error occurred';
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}

