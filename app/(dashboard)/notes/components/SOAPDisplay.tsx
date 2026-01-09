import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SOAPDisplayProps {
    subjective: string | null;
    objective: string | null;
    assessment: string | null;
    plan: string | null;
}

export function SOAPDisplay({ subjective, objective, assessment, plan }: SOAPDisplayProps) {
    const sections = [
        { title: "Subjective", content: subjective, description: "Patient's reported symptoms and history" },
        { title: "Objective", content: objective, description: "Observable findings and measurements" },
        { title: "Assessment", content: assessment, description: "Clinical diagnosis and evaluation" },
        { title: "Plan", content: plan, description: "Treatment plan and next steps" },
    ];

    const hasAnyContent = subjective || objective || assessment || plan;

    if (!hasAnyContent) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>SOAP Note</CardTitle>
                    <CardDescription>No SOAP note available yet</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>SOAP Note</CardTitle>
                <CardDescription>Structured clinical documentation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {sections.map((section) => (
                    section.content && (
                        <div key={section.title} className="space-y-2">
                            <div>
                                <h3 className="font-semibold text-lg">{section.title}</h3>
                                <p className="text-sm text-muted-foreground">{section.description}</p>
                            </div>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{section.content}</p>
                        </div>
                    )
                ))}
            </CardContent>
        </Card>
    );
}
