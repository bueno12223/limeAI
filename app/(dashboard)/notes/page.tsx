import { Suspense } from "react";
import { NotesListClient } from "./components/NotesListClient";
import { NoteSkeleton } from "./components/NoteSkeleton";

export default function NotesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Clinical Notes</h1>
                <p className="text-muted-foreground">
                    View and manage all patient notes
                </p>
            </div>

            <Suspense fallback={
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <NoteSkeleton key={i} />
                    ))}
                </div>
            }>
                <NotesListClient />
            </Suspense>
        </div>
    );
}
