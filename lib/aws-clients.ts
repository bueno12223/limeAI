import { TranscribeClient } from "@aws-sdk/client-transcribe";
import { ComprehendMedicalClient } from "@aws-sdk/client-comprehendmedical";
import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { S3Client } from "@aws-sdk/client-s3";
import { AWS_CONFIG } from "@/constants/config";

const CREDENTIALS = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
};

export const transcribeClient = new TranscribeClient({
    region: AWS_CONFIG.REGION,
    credentials: CREDENTIALS,
});

export const comprehendMedicalClient = new ComprehendMedicalClient({
    region: AWS_CONFIG.REGION,
    credentials: CREDENTIALS,
});

export const bedrockClient = new BedrockRuntimeClient({
    region: AWS_CONFIG.REGION,
    credentials: CREDENTIALS,
});

export const s3Client = new S3Client({
    region: AWS_CONFIG.REGION,
    credentials: CREDENTIALS,
});
