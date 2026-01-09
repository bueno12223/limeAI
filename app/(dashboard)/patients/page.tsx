import prisma from "@/lib/prisma";
import { PatientsClient } from "./components/PatientsClient";

export const dynamic = "force-dynamic";

export default async function PatientsPage() {
    const patients = await prisma.patient.findMany({
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Patients</h2>
            </div>
            <div className="h-full flex-1 flex-col space-y-8 md:flex">
                <PatientsClient initialPatients={patients} />
            </div>
        </div>
    );
}
