export const AWS_CONFIG = {
    REGION: process.env.LIME_AWS_REGION || "us-east-1",
    S3: {
        BUCKET_NAME: process.env.LIME_AWS_S3_BUCKET,
        PATHS: {
            UPLOADS_DIR: "public/recordings",
            TRANSCRIPTS_DIR: "transcriptions",
        }
    },
    TRANSCRIBE: {
        LANGUAGE_CODE: "en-US",
        SPECIALTY: "PRIMARYCARE",
        TYPE: "DICTATION",
    }
} as const;
