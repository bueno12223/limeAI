"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { API_ROUTES } from "@/constants/api";
import { SeedModal } from "./components/SeedModal";
import { Users, FileText } from "lucide-react";

export default function DashboardPage() {
    const [showSeedModal, setShowSeedModal] = useState(false);
    const [stats, setStats] = useState({ patients: 0, notes: 0 });

    const fetchStats = async () => {
        try {
            const res = await fetch(API_ROUTES.STATS);
            if (res.ok) {
                const data = await res.json();
                setStats({ patients: data.patients, notes: data.notes });
                if (data.patients === 0) {
                    setShowSeedModal(true);
                }
                return;
            }
            toast.error("Failed to load dashboard stats");

        } catch (e: unknown) {
            console.error("Failed to fetch stats", e);
            toast.error("Failed to connect to server");
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <div className="h-full w-full flex flex-col gap-4">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Total Patients</h3>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="pt-4">
                        <div className="text-2xl font-bold">{stats.patients}</div>
                        <p className="text-xs text-muted-foreground">
                            Active records in database
                        </p>
                    </div>
                </div>

                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Clinical Notes</h3>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="pt-4">
                        <div className="text-2xl font-bold">{stats.notes}</div>
                        <p className="text-xs text-muted-foreground">
                            Processed notes
                        </p>
                    </div>
                </div>
            </div>

            <SeedModal
                isOpen={showSeedModal}
                onOpenChange={setShowSeedModal}
                onComplete={() => {
                    fetchStats();
                }}
            />
        </div>
    );
}
