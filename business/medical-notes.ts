import {
    DetectEntitiesV2Command,
    DetectEntitiesV2CommandOutput,
    Entity
} from '@aws-sdk/client-comprehendmedical';
import { EntityType } from '@prisma/client';
import { comprehendMedicalClient } from '@/lib/aws-clients';
import { MappedEntity, SOAPData } from '@/types/medical';

import { generateSOAPContent } from "@/lib/llm";

export async function generateStructuredSOAP(transcript: string, entities: MappedEntity[]): Promise<SOAPData> {
    const SUBJECTIVE_PLACEHOLDER = `Patient Transcript: ${transcript}`;

    const medications = entities
        .filter(e => e.category === EntityType.MEDICATION)
        .map(e => {
            const parts = [e.text];
            if (e.dosage) parts.push(e.dosage);
            if (e.frequency) parts.push(e.frequency);
            return parts.join(' ');
        });
    const planText = medications.length > 0 ? medications.join(', ') : "No specific medications identified.";

    const diagnoses = entities
        .filter(e => e.category === EntityType.DIAGNOSIS)
        .map(e => e.text)
        .join(", ");

    const prompt = `
You are a professional Medical Scribe. Your task is to transform a raw medical transcript into a structured SOAP note. 
Ensure the tone is clinical and concise.

Context - Diagnosed Conditions: ${diagnoses || "None identified"}

Raw Transcript:
"${transcript}"

Instructions:
1. Treat the transcript as a single-speaker medical dictation from a clinician.
2. Summarize the "Subjective" section concisely based on the patient symptoms and history described. Do NOT just copy the transcript.
3. Extract the "Assessment" section based on the clinician's findings and diagnoses.
4. Extract the "Plan" section based on the clinician's instructions and medications.
5. Check the "Context - Diagnosed Conditions" list provided above for reference.
6. Output MUST be valid JSON with keys: "subjective", "objective", "assessment". Do not include "plan".

Output JSON format:
{
  "subjective": "...",
  "objective": "...",
  "assessment": "..."
}
`;

    try {
        const aiContent = await generateSOAPContent(prompt);

        const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Failed to parse JSON from AI response");
        }

        const parsedAI = JSON.parse(jsonMatch[0]);

        return {
            subjective: parsedAI.subjective || SUBJECTIVE_PLACEHOLDER,
            objective: parsedAI.objective || null,
            assessment: parsedAI.assessment || (diagnoses ? `Diagnoses: ${diagnoses}` : "No specific assessment generated."),
            plan: planText
        };
    } catch (error) {
        console.error("SOAP Generation Failed:", error);
        return {
            subjective: `[AI Generation Failed] ${SUBJECTIVE_PLACEHOLDER}`,
            objective: null,
            assessment: diagnoses ? `Diagnoses: ${diagnoses}` : "No specific diagnoses identified.",
            plan: planText
        };
    }
}

export async function process(transcriptText: string) {
    if (!transcriptText) {
        throw new Error("Transcript is empty");
    }

    let awsEntities: Entity[] = [];
    try {
        const detectCommand = new DetectEntitiesV2Command({ Text: transcriptText });
        const entitiesResponse: DetectEntitiesV2CommandOutput = await comprehendMedicalClient.send(detectCommand);
        awsEntities = entitiesResponse.Entities || [];
    } catch (comprehendError) {
        console.error("Comprehend Medical Error:", comprehendError);
        throw new Error("Medical Entity Extraction Failed");
    }

    const mappedEntities: MappedEntity[] = awsEntities
        .filter(e => {
            const category = e.Category;
            return category === 'MEDICATION' || category === 'MEDICAL_CONDITION';
        })
        .map(e => {
            let category: EntityType = EntityType.OTHER;

            if (e.Category === 'MEDICAL_CONDITION') {
                category = EntityType.DIAGNOSIS;
            } else if (e.Category === 'MEDICATION') {
                category = EntityType.MEDICATION;
            }

            const getAttribute = (type: 'DOSAGE' | 'FREQUENCY') => {
                if (!e.Attributes || e.Attributes.length === 0) return null;

                const matches = e.Attributes.filter(a => a.Type === type);
                if (matches.length === 0) return null;

                matches.sort((a, b) => (b.Score || 0) - (a.Score || 0));
                return matches[0].Text || null;
            };

            return {
                text: e.Text || "Unknown Entity",
                category: category,
                score: e.Score || 0,
                dosage: getAttribute('DOSAGE'),
                frequency: getAttribute('FREQUENCY'),
            };
        });

    return {
        success: true,
        entities: mappedEntities
    };
}
