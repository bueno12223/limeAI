import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";

interface ProcessingModalProps {
    open: boolean;
    step: "uploading" | "transcribing" | "processing";
}

export function ProcessingModal({ open, step }: ProcessingModalProps) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!open) {
            setProgress(0);
            return;
        }

        let interval: NodeJS.Timeout;

        if (step === "uploading") {
            setProgress(0);
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 30) return 30;
                    return prev + 5;
                });
            }, 200);
        } else if (step === "transcribing") {
            setProgress(30);
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 80) return 80;
                    return prev + 2;
                });
            }, 800);
        } else if (step === "processing") {
            setProgress(80);
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 95) return 95;
                    return prev + 5;
                });
            }, 300);
        }

        return () => clearInterval(interval);
    }, [step, open]);

    const getMessage = () => {
        switch (step) {
            case "uploading": return "Uploading audio file...";
            case "transcribing": return "Transcribing medical audio (this may take a moment)...";
            case "processing": return "Extracting medical entities and SOAP notes...";
        }
    };

    return (
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        Processing Note
                    </DialogTitle>
                    <DialogDescription>
                        Please wait while we process your medical note secureley.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Progress value={progress} className="h-2" />
                    <p className="text-sm text-center text-muted-foreground animate-pulse">
                        {getMessage()}
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
