"use client";

import { useEffect, useState } from "react";
import { NoteWithPatient } from "@/types/api";
import { API_ROUTES } from "@/constants/api";
import { NoteCard } from "./NoteCard";
import { NoteSkeleton } from "./NoteSkeleton";

export function NotesListClient() {
    const [notes, setNotes] = useState<NoteWithPatient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const response = await fetch(API_ROUTES.NOTES);

                if (!response.ok) {
                    throw new Error('Failed to fetch notes');
                }

                const data = await response.json();
                setNotes(data.notes);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotes();
    }, []);

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                    <NoteSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-destructive">Error: {error}</p>
            </div>
        );
    }

    if (notes.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">No notes found</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
                <NoteCard key={note.id} note={note} />
            ))}
        </div>
    );
}
