#!/bin/bash
set -e

BUCKET_NAME=${AWS_S3_BUCKET:-"limeai-medical-storage-$(date +%s)"}
REGION=${AWS_REGION:-"us-east-1"}

echo "Creating S3 Bucket: $BUCKET_NAME in $REGION..."

# Create Bucket (Check region to avoid LocationConstraint errors for us-east-1)
if [ "$REGION" = "us-east-1" ]; then
    aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$REGION"
else
    aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$REGION" --create-bucket-configuration LocationConstraint="$REGION"
fi

# Enable CORS for Browser Uploads
echo "Configuring CORS..."
aws s3api put-bucket-cors --bucket "$BUCKET_NAME" --cors-configuration '{
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["PUT", "POST", "GET"],
            "AllowedOrigins": ["*"],
            "ExposeHeaders": ["ETag"]
        }
    ]
}'

echo "✅ S3 Bucket $BUCKET_NAME created and configured!"
echo "Add this to your .env: AWS_S3_BUCKET=$BUCKET_NAME"
