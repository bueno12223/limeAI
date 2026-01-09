"use client";

import { API_ROUTES } from "@/constants/api";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Loader2, Database, Table as TableIcon, Users } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface SeedModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onComplete: () => void;
    mode?: "initial" | "create";
}

export function SeedModal({ isOpen, onOpenChange, onComplete, mode = "initial" }: SeedModalProps) {
    const [count, setCount] = useState<number[]>([3]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isLoading) e.preventDefault();
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isLoading]);

    const handleSeed = async () => {
        setIsLoading(true);
        const toastId = toast.loading("Generating patient records...");

        try {
            const res = await fetch(`${API_ROUTES.SEED_PATIENTS}?count=${count[0]}`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Request failed");

            toast.dismiss(toastId);
            toast.success(`Successfully created ${data.count} patients!`);
            onComplete();
            onOpenChange(false);
        } catch (error: unknown) {
            console.error("Seeding error:", error);
            toast.dismiss(toastId);

            let msg = "Unknown error occurred";
            if (error instanceof Error) msg = error.message;

            const displayMsg = msg.length > 50 ? "Creation failed. Please try again." : `Failed: ${msg}`;
            toast.error(displayMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        if (!isLoading) onOpenChange(false);
    }

    const isInitial = mode === "initial";

    return (
        <Dialog open={isOpen} onOpenChange={(val) => !isLoading && onOpenChange(val)}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        {isInitial ? <Database className="h-5 w-5 text-primary" /> : <Users className="h-5 w-5 text-primary" />}
                        {isInitial ? "Initialize Database" : "Create Patients"}
                    </DialogTitle>
                    <DialogDescription>
                        {isInitial
                            ? "Your database is currently empty. Populate it with mock data to get started."
                            : "Generate additional mock patient records for testing."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="rounded-md border bg-muted/30">
                        <div className="p-3 border-b flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted/50">
                            <TableIcon className="h-4 w-4" />
                            Data Preview (Example)
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>MRN</TableHead>
                                    <TableHead>Full Name</TableHead>
                                    <TableHead>DOB (Age)</TableHead>
                                    <TableHead>Sex</TableHead>
                                    <TableHead>Email</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-mono text-xs">MRN-X7K9P2</TableCell>
                                    <TableCell>John Doe</TableCell>
                                    <TableCell>1980-05-15 (45)</TableCell>
                                    <TableCell>MALE</TableCell>
                                    <TableCell className="text-muted-foreground w-[200px] truncate">john.doe@example.com</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-mono text-xs">MRN-A1B2C3</TableCell>
                                    <TableCell>Jane Smith</TableCell>
                                    <TableCell>1992-11-20 (33)</TableCell>
                                    <TableCell>FEMALE</TableCell>
                                    <TableCell className="text-muted-foreground w-[200px] truncate">j.smith@test.org</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                        <div className="p-2 text-xs text-center text-muted-foreground bg-muted/20 border-t">
                            + Clinical data (Allergies, Medications, Diagnoses)
                        </div>
                    </div>

                    <div className="space-y-4 px-1">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="count" className="text-base">Number of Patients</Label>
                            <span className="text-lg font-bold text-primary">{count[0]}</span>
                        </div>
                        <Slider
                            id="count"
                            min={1}
                            max={10}
                            step={1}
                            value={count}
                            onValueChange={setCount}
                            disabled={isLoading}
                            className="py-4"
                        />
                        <p className="text-xs text-muted-foreground text-right">
                            Instantly generates clinical records
                        </p>
                    </div>
                </div>

                <DialogFooter className="sm:justify-between sm:gap-0 gap-2">
                    {!isLoading && (
                        <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
                    )}
                    {isLoading ? (
                        <Button disabled className="w-full sm:w-auto ml-auto">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                        </Button>
                    ) : (
                        <Button size="lg" onClick={handleSeed} className="w-full sm:w-auto">
                            {isInitial ? "Seed Database" : "Create Patients"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
