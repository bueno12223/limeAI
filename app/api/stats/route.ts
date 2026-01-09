import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const [patientCount, noteCount] = await prisma.$transaction([
            prisma.patient.count(),
            prisma.note.count(),
        ]);

        return NextResponse.json({
            patients: patientCount,
            notes: noteCount
        });
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
