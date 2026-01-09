import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MedicalEntity, EntityType } from "@prisma/client";
import { Stethoscope, Pill, Activity, FileText } from "lucide-react";

interface EntitiesTableProps {
    entities: MedicalEntity[];
}

export function EntitiesTable({ entities }: EntitiesTableProps) {
    const diagnoses = entities.filter(e => e.category === EntityType.DIAGNOSIS);
    const medications = entities.filter(e => e.category === EntityType.MEDICATION);

    if (entities.length === 0) {
        return (
            <Card className="border-dashed">
                <CardHeader className="text-center pb-10 pt-10">
                    <div className="mx-auto bg-muted p-3 rounded-full w-fit mb-4">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-muted-foreground">No entities extracted</CardTitle>
                    <CardDescription>Processed medical information will appear here.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            {diagnoses.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Stethoscope className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold tracking-tight">Diagnoses & Conditions</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {diagnoses.map((entity) => (
                            <Card key={entity.id} className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-4 flex flex-col gap-1">
                                    <div className="flex justify-between items-start gap-2">
                                        <span className="font-medium text-base truncate" title={entity.text}>
                                            {entity.text}
                                        </span>
                                        <Badge variant="secondary" className="text-xs shrink-0">
                                            {(entity.score * 100).toFixed(0)}%
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                                        <Activity className="h-3 w-3" />
                                        <span>Detected in transcript</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {medications.length > 0 && (
                <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                            <Pill className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-semibold tracking-tight">Medications</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {medications.map((entity) => (
                            <Card key={entity.id} className="group shadow-sm hover:border-emerald-500/50 transition-all">
                                <CardContent className="p-4 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center shrink-0">
                                            <Pill className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-base">{entity.text}</h4>
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                                                {entity.dosage && (
                                                    <Badge variant="outline" className="text-xs bg-muted/50">
                                                        {entity.dosage}
                                                    </Badge>
                                                )}
                                                {entity.frequency && (
                                                    <span className="flex items-center gap-1 text-xs">
                                                        <span>•</span> {entity.frequency}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right shrink-0">
                                        <div className="text-xs text-muted-foreground mb-1">Confidence</div>
                                        <Badge variant={entity.score > 0.9 ? "default" : "secondary"} className={entity.score > 0.9 ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                                            {(entity.score * 100).toFixed(0)}%
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
