import { Suspense } from "react";
import { NoteDetailClient } from "./components/NoteDetailClient";
import { NoteDetailSkeleton } from "@/app/(dashboard)/notes/components/NoteSkeleton";

interface NoteDetailPageProps {
    params: {
        id: string;
    };
}

export default function NoteDetailPage({ params }: NoteDetailPageProps) {
    return (
        <Suspense fallback={<NoteDetailSkeleton />}>
            <NoteDetailClient noteId={params.id} />
        </Suspense>
    );
}
