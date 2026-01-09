"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NoteDetail } from "@/types/api";
import { NoteStatus } from "@prisma/client";
import { toast } from "sonner";
import { API_ROUTES, PAGE_ROUTES } from "@/constants/api";
import { NoteDetailSkeleton } from "@/app/(dashboard)/notes/components/NoteSkeleton";
import { SOAPDisplay } from "@/app/(dashboard)/notes/components/SOAPDisplay";
import { EntitiesTable } from "@/app/(dashboard)/notes/components/EntitiesTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { STATUS_COLORS } from "@/constants/ui";
import { ArrowLeft, FileAudio, FileText, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface NoteDetailClientProps {
    noteId: string;
}

export function NoteDetailClient({ noteId }: NoteDetailClientProps) {
    const router = useRouter();
    const [note, setNote] = useState<NoteDetail | null>(null);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInitialNote = async () => {
            try {
                const response = await fetch(API_ROUTES.NOTE_BY_ID(noteId));

                if (!response.ok) {
                    throw new Error('Failed to fetch note');
                }

                const data = await response.json();
                setNote(data.note);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setIsInitialLoading(false);
            }
        };

        fetchInitialNote();
    }, [noteId]);

    const handleBack = () => {
        router.push(PAGE_ROUTES.NOTES);
    };

    if (isInitialLoading) {
        return <NoteDetailSkeleton />;
    }

    if (error || !note) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Notes
                </Button>
                <div className="text-center py-12">
                    <p className="text-destructive">Error: {error || 'Note not found'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Notes
                </Button>
                <Badge className={STATUS_COLORS[note.status]}>
                    {note.status}
                </Badge>
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    {note.type === "AUDIO" ? (
                        <FileAudio className="h-6 w-6 text-muted-foreground" />
                    ) : (
                        <FileText className="h-6 w-6 text-muted-foreground" />
                    )}
                    <h1 className="text-3xl font-bold tracking-tight">
                        {note.patient.lastName}, {note.patient.firstName}
                    </h1>
                </div>
                <p className="text-muted-foreground">
                    Created {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                    {" • "}
                    MRN: {note.patient.mrn}
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Patient Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="font-semibold text-muted-foreground block mb-1">Sex</span>
                        {note.patient.sex}
                    </div>
                    <div>
                        <span className="font-semibold text-muted-foreground block mb-1">Date of Birth</span>
                        {new Date(note.patient.dateOfBirth).toLocaleDateString()}
                    </div>
                    <div>
                        <span className="font-semibold text-muted-foreground block mb-1">Phone</span>
                        {note.patient.phone || "N/A"}
                    </div>
                    <div>
                        <span className="font-semibold text-muted-foreground block mb-1">Address</span>
                        {note.patient.addressLine1 ? (
                            <span>
                                {note.patient.addressLine1}
                                {note.patient.city && `, ${note.patient.city}`}
                                {note.patient.state && `, ${note.patient.state}`}
                            </span>
                        ) : "N/A"}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Transcript</CardTitle>
                    <CardDescription>
                        {note.type === "AUDIO" ? "Audio transcription" : "Text input"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {note.content ? (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{note.content}</p>
                    ) : (
                        <p className="text-sm text-muted-foreground italic">No content available</p>
                    )}
                </CardContent>
            </Card>

            <SOAPDisplay
                subjective={note.subjective}
                objective={note.objective}
                assessment={note.assessment}
                plan={note.plan}
            />

            <EntitiesTable entities={note.medicalEntities} />
        </div>
    );
}
