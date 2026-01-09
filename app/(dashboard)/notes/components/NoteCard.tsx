import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NoteWithPatient } from "@/types/api";
import { NoteStatus, NoteType } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { PAGE_ROUTES } from "@/constants/api";
import { STATUS_COLORS } from "@/constants/ui";
import { FileAudio, FileText, Loader2 } from "lucide-react";

interface NoteCardProps {
    note: NoteWithPatient;
}

export function NoteCard({ note }: NoteCardProps) {
    const isProcessing = note.status === NoteStatus.PROCESSING;

    return (
        <Link href={PAGE_ROUTES.NOTE_DETAIL(note.id)}>
            <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                            {note.type === NoteType.AUDIO ? (
                                <FileAudio className="h-5 w-5 text-muted-foreground" />
                            ) : (
                                <FileText className="h-5 w-5 text-muted-foreground" />
                            )}
                            <CardTitle className="text-lg">
                                {note.patient.lastName}, {note.patient.firstName}
                            </CardTitle>
                        </div>
                        <Badge className={STATUS_COLORS[note.status]}>
                            {isProcessing && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                            {note.status}
                        </Badge>
                    </div>
                    <CardDescription>
                        {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {note.content || "No content available"}
                    </p>
                </CardContent>
            </Card>
        </Link>
    );
}
