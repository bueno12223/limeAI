import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const count = await prisma.patient.count();
        return NextResponse.json({ count });
    } catch (error) {
        console.error("Error fetching patient count:", error);
        return NextResponse.json({ error: "Failed to fetch patient count" }, { status: 500 });
    }
}
