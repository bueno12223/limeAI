import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/lib/aws-clients";
import { AWS_CONFIG } from "@/constants/config";

export async function uploadAudioToS3(audioFile: File): Promise<string> {
    if (!AWS_CONFIG.S3.BUCKET_NAME) {
        throw new Error("AWS_S3_BUCKET is not configured");
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const filename = `${Date.now()}-${audioFile.name}`;
    const key = `${AWS_CONFIG.S3.PATHS.UPLOADS_DIR}/${filename}`;

    try {
        const uploadCommand = new PutObjectCommand({
            Bucket: AWS_CONFIG.S3.BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: audioFile.type,
        });
        await s3Client.send(uploadCommand);
        return key;
    } catch (uploadError) {
        console.error("S3 Upload Failed:", uploadError);
        throw new Error("Failed to upload audio file to storage.");
    }
}
