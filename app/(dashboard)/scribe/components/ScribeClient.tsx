"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Patient } from "@prisma/client";
import { toast } from "sonner";
import { Check, ChevronsUpDown, Mic, Upload, Keyboard, FileAudio, Loader2, Pause, Play, Square, Delete, Trash } from "lucide-react";
import { ProcessingModal } from "./ProcessingModal";


import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import { useCustomForm } from "@/hooks/use-custom-form";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { ScribeFormValues, initialValues, scribeValidationSchema } from "../validations";
import { createNote } from "@/app/actions/scribe";
import { PAGE_ROUTES } from "@/constants/api";

interface ScribeClientProps {
    patients: Patient[];
}

export function ScribeClient({ patients }: ScribeClientProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const {
        isRecording,
        isPaused,
        recordingTime,
        startRecording,
        stopRecording,
        togglePauseResume,
        audioBlob,
        clearAudio
    } = useAudioRecorder();

    const [processingStep, setProcessingStep] = useState<"uploading" | "transcribing" | "processing" | null>(null);

    const formik = useCustomForm<ScribeFormValues>({
        initialValues,
        validationSchema: scribeValidationSchema,
        onSubmit: async (values) => {
            try {
                if (values.type === "AUDIO" && values.audioFile) {
                    setProcessingStep("uploading");
                } else if (values.type === "TEXT") {
                    setProcessingStep("processing");
                } else {
                    setProcessingStep("transcribing");
                }

                const formData = new FormData();
                formData.append("patientId", values.patientId);
                formData.append("type", values.type);

                if (values.content) {
                    formData.append("content", values.content);
                }

                if (values.type === "AUDIO" && values.audioFile) {
                    formData.append("audioFile", values.audioFile);
                }

                const result = await createNote(formData);

                if (result.success && result.noteId) {
                    toast.success("Note saved successfully!");
                    setProcessingStep("processing");
                    setTimeout(() => {
                        router.push(`${PAGE_ROUTES.NOTES}/${result.noteId}`);
                    }, 500);
                    return;
                }

                setProcessingStep(null);
                throw new Error(result.error || "Failed to save note");

            } catch (error: unknown) {
                setProcessingStep(null);
                let errorMessage = "Something went wrong saving the note.";
                if (error instanceof Error) {
                    errorMessage = error.message;
                }
                toast.error(errorMessage);
            }
        },
    });

    useEffect(() => {
        if (!audioBlob) return;

        const file = new File([audioBlob], "recording.mp3", { type: "audio/mp3" });
        formik.setFieldValue("audioFile", file);

    }, [audioBlob]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleTabChange = (val: string) => {
        const newType = val === "mic" || val === "upload" ? "AUDIO" : "TEXT";
        formik.setFieldValue("type", newType);

        if (newType === "TEXT") {
            formik.setFieldValue("audioFile", null);
            clearAudio();
        }
    };

    const handlePatientSelect = (patientId: string) => {
        formik.setFieldValue("patientId", patientId);
        setOpen(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.currentTarget.files?.[0];
        if (file) formik.setFieldValue("audioFile", file);
    };

    const handleChooseFile = () => {
        document.getElementById('audio-upload')?.click();
    };

    const selectedPatient = patients.find((p) => p.id === formik.values.patientId);

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <ProcessingModal open={!!processingStep} step={processingStep || "transcribing"} />
            <div className="col-span-3 space-y-6">
                <Card className={cn(formik.touched.patientId && formik.errors.patientId ? "border-destructive" : "")}>
                    <CardHeader>
                        <CardTitle>Select Patient</CardTitle>
                        <CardDescription>Who is this visit for?</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-full justify-between"
                                >
                                    {formik.values.patientId
                                        ? patients.find((p) => p.id === formik.values.patientId)?.lastName + ", " + patients.find((p) => p.id === formik.values.patientId)?.firstName
                                        : "Search patient..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0">
                                <Command>
                                    <CommandInput placeholder="Search name or MRN..." />
                                    <CommandEmpty>No patient found.</CommandEmpty>
                                    <CommandGroup className="max-h-[200px] overflow-y-auto">
                                        {patients.map((patient) => (
                                            <CommandItem
                                                key={patient.id}
                                                value={`${patient.firstName} ${patient.lastName} ${patient.mrn}`}
                                                onSelect={() => handlePatientSelect(patient.id)}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        formik.values.patientId === patient.id ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                <div className="flex items-center gap-2">
                                                    {patient.avatarUrl ? (
                                                        <img
                                                            src={patient.avatarUrl}
                                                            alt={`${patient.firstName} ${patient.lastName}`}
                                                            className="h-8 w-8 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                                                            {patient.firstName[0]}{patient.lastName[0]}
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{patient.lastName}, {patient.firstName}</span>
                                                        <span className="text-xs text-muted-foreground">{patient.mrn}</span>
                                                    </div>
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        {formik.submitCount > 0 && formik.errors.patientId && (
                            <p className="text-sm text-destructive font-medium">{formik.errors.patientId}</p>
                        )}
                    </CardContent>
                </Card>

                {selectedPatient && (
                    <Card className="animate-in fade-in slide-in-from-top-2">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                {selectedPatient.avatarUrl ? (
                                    <img
                                        src={selectedPatient.avatarUrl}
                                        alt={`${selectedPatient.firstName} ${selectedPatient.lastName}`}
                                        className="h-6 w-6 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
                                        {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                                    </div>
                                )}
                                Patient Context
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 text-sm">
                            <div className="grid grid-cols-2 gap-1">
                                <span className="text-muted-foreground">DOB (Age):</span>
                                <span>
                                    {new Date(selectedPatient.dateOfBirth).toLocaleDateString()}
                                    {" "}
                                    ({new Date().getFullYear() - new Date(selectedPatient.dateOfBirth).getFullYear()})
                                </span>

                                <span className="text-muted-foreground">Sex:</span>
                                <span>{selectedPatient.sex}</span>

                                <span className="text-muted-foreground">MRN:</span>
                                <span className="font-mono">{selectedPatient.mrn}</span>
                            </div>

                            <div className="space-y-2 pt-2 border-t">
                                <span className="text-muted-foreground font-medium block">Allergies</span>
                                {selectedPatient.allergies.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                        {selectedPatient.allergies.map((a, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                                {a}
                                            </span>
                                        ))}
                                    </div>
                                ) : <span className="text-muted-foreground italic">None known</span>}
                            </div>

                            <div className="space-y-2 pt-2 border-t">
                                <span className="text-muted-foreground font-medium block">Active Diagnoses</span>
                                {selectedPatient.diagnoses.length > 0 ? (
                                    <div className="flex flex-col gap-1">
                                        {selectedPatient.diagnoses.map((d, i) => (
                                            <span key={i} className="text-xs">• {d}</span>
                                        ))}
                                    </div>
                                ) : <span className="text-muted-foreground italic">None listed</span>}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <div className="col-span-4">
                <Card className="h-full flex flex-col">
                    <CardHeader>
                        <CardTitle>Clinical Note Input</CardTitle>
                        <CardDescription>Capture the encounter details</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <Tabs defaultValue="mic" className="h-full flex flex-col" onValueChange={handleTabChange}>
                            <TabsList className="grid w-full grid-cols-3 mb-4">
                                <TabsTrigger value="mic" className="gap-2"><Mic className="h-4 w-4" /> Dictate</TabsTrigger>
                                <TabsTrigger value="text" className="gap-2"><Keyboard className="h-4 w-4" /> Type</TabsTrigger>
                                <TabsTrigger value="upload" className="gap-2"><Upload className="h-4 w-4" /> Upload</TabsTrigger>
                            </TabsList>

                            <TabsContent value="mic" className="h-full mt-0 border-0 p-0">
                                <div className="h-full flex flex-col items-center justify-center space-y-6 py-8 border-2 border-dashed rounded-lg bg-muted/10">
                                    <div className={cn(
                                        "w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500",
                                        isRecording && !isPaused ? "bg-red-100 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]" : "bg-muted"
                                    )}>
                                        <Mic className={cn("h-12 w-12", isRecording ? "text-red-500" : "text-muted-foreground")} />
                                    </div>
                                    <div className="text-center space-y-1">
                                        <h3 className="font-medium text-lg min-h-[1.75rem]">
                                            {isRecording ? (isPaused ? "Paused" : "Recording...") : (audioBlob ? "Recording Complete" : "Ready to Record")}
                                        </h3>
                                        <p className="text-sm text-muted-foreground font-mono">
                                            {formatTime(recordingTime)}
                                        </p>
                                    </div>

                                    <div className="flex gap-4">
                                        {!isRecording && !audioBlob && (
                                            <Button size="lg" onClick={startRecording} className="min-w-[150px]">
                                                Start Recording
                                            </Button>
                                        )}

                                        {isRecording && (
                                            <>
                                                <Button size="lg" variant="outline" onClick={togglePauseResume}>
                                                    {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                                                    {isPaused ? "Resume" : "Pause"}
                                                </Button>
                                                <Button size="lg" variant="destructive" onClick={stopRecording}>
                                                    <Square className="h-4 w-4 mr-2" /> Stop
                                                </Button>
                                            </>
                                        )}

                                        {!isRecording && audioBlob && (
                                            <div className="flex flex-col gap-2 items-center">
                                                <div className="flex gap-2">
                                                    <Button variant="outline" onClick={clearAudio} title="Discard Recording">
                                                        <Trash className="h-4 w-4 mr-2" /> Discard
                                                    </Button>
                                                    <Button
                                                        onClick={() => formik.submitForm()}
                                                        disabled={formik.isSubmitting}
                                                    >
                                                        {formik.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                        Submit Recording
                                                    </Button>
                                                </div>
                                                <audio controls src={URL.createObjectURL(audioBlob)} className="mt-4" />
                                            </div>
                                        )}
                                    </div>

                                    {isRecording && !isPaused && (
                                        <div className="flex gap-1 h-4 items-end">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className="w-1 bg-red-400 rounded-full animate-bounce" style={{ height: Math.random() * 16 + 4, animationDelay: `${i * 0.1}s` }} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="text" className="h-full mt-0 border-0 p-0">
                                <div className="h-full flex flex-col space-y-4">
                                    <div className="flex-1">
                                        <Textarea
                                            placeholder="Type your clinical notes here..."
                                            className={cn("min-h-[300px] resize-none text-base p-4", formik.touched.content && formik.errors.content && "border-destructive focus-visible:ring-destructive")}
                                            value={formik.values.content}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            name="content"
                                        />
                                        {formik.touched.content && formik.errors.content && (
                                            <p className="text-sm text-destructive mt-1">{formik.errors.content}</p>
                                        )}
                                    </div>
                                    <div className="flex justify-end">
                                        <Button onClick={() => formik.submitForm()} disabled={formik.isSubmitting}>
                                            {formik.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Save Note
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="upload" className="h-full mt-0 border-0 p-0">
                                <div className="h-full flex flex-col items-center justify-center space-y-6 py-8 border-2 border-dashed rounded-lg">
                                    <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
                                        <FileAudio className="h-10 w-10 text-blue-500" />
                                    </div>
                                    <div className="text-center space-y-1">
                                        <h3 className="font-medium text-lg">{formik.values.audioFile ? formik.values.audioFile.name : "Upload Audio File"}</h3>
                                        <p className="text-sm text-muted-foreground">MP3, WAV, or M4A supported</p>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <input
                                            type="file"
                                            id="audio-upload"
                                            className="hidden"
                                            accept="audio/mp3"
                                            onChange={handleFileChange}
                                        />
                                        <Button variant="outline" onClick={handleChooseFile}>
                                            Choose File
                                        </Button>
                                        {formik.values.audioFile && (
                                            <Button onClick={() => formik.submitForm()} disabled={formik.isSubmitting}>
                                                {formik.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Upload & Transcribe
                                            </Button>
                                        )}
                                        {formik.submitCount > 0 && formik.errors.audioFile && (
                                            <p className="text-sm text-destructive text-center">{formik.errors.audioFile}</p>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
