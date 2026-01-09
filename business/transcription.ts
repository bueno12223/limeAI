import {
    StartMedicalTranscriptionJobCommand,
    GetMedicalTranscriptionJobCommand
} from "@aws-sdk/client-transcribe";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { transcribeClient, s3Client } from "@/lib/aws-clients";
import { AWS_CONFIG } from "@/constants/config";
import { Readable } from 'stream';

const streamToString = (stream: Readable | ReadableStream | Blob): Promise<string> =>
    new Promise((resolve, reject) => {
        const chunks: Uint8Array[] = [];
        if (stream instanceof Readable) {
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('error', reject);
            stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
        } else {
            reject(new Error("Unsupported stream type"));
        }
    });

export async function transcribeAudio(key: string): Promise<string> {
    const jobName = `job-${Date.now()}`;
    const fileUri = `s3://${AWS_CONFIG.S3.BUCKET_NAME}/${key}`;

    const transcriptKey = `${AWS_CONFIG.S3.PATHS.TRANSCRIPTS_DIR}/medical/${jobName}.json`;

    try {
        const startCommand = new StartMedicalTranscriptionJobCommand({
            MedicalTranscriptionJobName: jobName,
            LanguageCode: "en-US",
            Media: { MediaFileUri: fileUri },
            OutputBucketName: AWS_CONFIG.S3.BUCKET_NAME,
            OutputKey: transcriptKey,
            Specialty: "PRIMARYCARE",
            Type: "DICTATION",
        });
        await transcribeClient.send(startCommand);
    } catch (awsError) {
        console.error("AWS Transcribe Start Error:", awsError);
        throw new Error("Failed to start transcription job");
    }

    let jobStatus = "IN_PROGRESS";
    while (jobStatus === "IN_PROGRESS" || jobStatus === "QUEUED") {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const getJobCommand = new GetMedicalTranscriptionJobCommand({
            MedicalTranscriptionJobName: jobName,
        });
        const jobResult = await transcribeClient.send(getJobCommand);
        jobStatus = jobResult.MedicalTranscriptionJob?.TranscriptionJobStatus || "FAILED";
    }

    if (jobStatus !== "COMPLETED") {
        throw new Error(`Transcription job failed with status: ${jobStatus}`);
    }

    const getObjectCommand = new GetObjectCommand({
        Bucket: AWS_CONFIG.S3.BUCKET_NAME,
        Key: transcriptKey,
    });

    const s3Response = await s3Client.send(getObjectCommand);
    const transcriptBody = await streamToString(s3Response.Body as Readable);
    const transcriptJson = JSON.parse(transcriptBody);

    const transcriptText = transcriptJson.results?.transcripts?.[0]?.transcript || "";

    if (!transcriptText) {
        throw new Error("Empty transcript generated");
    }

    return transcriptText;
}
