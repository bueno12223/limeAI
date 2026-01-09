"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Patient } from "@prisma/client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SeedModal } from "../../components/SeedModal";
import { Plus, Search, User } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface PatientsClientProps {
    initialPatients: Patient[];
}

export function PatientsClient({ initialPatients }: PatientsClientProps) {
    const router = useRouter();
    const [patients, setPatients] = useState<Patient[]>(initialPatients);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSeedModalOpen, setIsSeedModalOpen] = useState(false);

    const filteredPatients = patients.filter((patient) => {
        const query = searchQuery.toLowerCase();
        const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
        const mrn = patient.mrn.toLowerCase();
        return fullName.includes(query) || mrn.includes(query);
    });

    const handleSeedComplete = () => {
        router.refresh();
        window.location.reload();
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 w-full max-w-sm">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or MRN..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 w-[150px] lg:w-[250px]"
                    />
                </div>
                <Button onClick={() => setIsSeedModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Create Patients
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>MRN</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>DOB (Age)</TableHead>
                            <TableHead>Sex</TableHead>
                            <TableHead>Created</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPatients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredPatients.map((patient) => (
                                <TableRow key={patient.id}>
                                    <TableCell className="font-mono">{patient.mrn}</TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {patient.avatarUrl ? (
                                                <img
                                                    src={patient.avatarUrl}
                                                    alt={`${patient.firstName} ${patient.lastName}`}
                                                    className="h-8 w-8 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                    {patient.firstName[0]}{patient.lastName[0]}
                                                </div>
                                            )}
                                            {patient.firstName} {patient.lastName}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(patient.dateOfBirth), "MM/dd/yyyy")}
                                        <span className="text-muted-foreground text-xs ml-1">
                                            ({new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()})
                                        </span>
                                    </TableCell>
                                    <TableCell>{patient.sex}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {formatDistanceToNow(new Date(patient.createdAt), { addSuffix: true })}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="text-xs text-muted-foreground">
                Showing {filteredPatients.length} of {patients.length} patients
            </div>

            <SeedModal
                isOpen={isSeedModalOpen}
                onOpenChange={setIsSeedModalOpen}
                onComplete={handleSeedComplete}
                mode="create"
            />
        </div>
    );
}
