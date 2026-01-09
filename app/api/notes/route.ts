import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const notes = await prisma.note.findMany({
            include: {
                patient: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ notes });
    } catch (error: unknown) {
        console.error("Failed to fetch notes:", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
