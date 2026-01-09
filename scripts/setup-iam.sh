#!/bin/bash
set -e

# Configuration
USERNAME="lime-ai-service-user"
POLICY_NAME="LimeAI-Core-Policy"
BUCKET_NAME=${AWS_S3_BUCKET:-"limeai-medical-storage"}

echo "Creating IAM User and Policies..."

# 1. Create User (ignore error if exists)
aws iam create-user --user-name "$USERNAME" || echo "User likely exists, continuing..."

# 2. Create Policy Definition JSON
cat <<EOF > /tmp/limeai-policy.json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "S3Access",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::$BUCKET_NAME",
                "arn:aws:s3:::$BUCKET_NAME/*"
            ]
        },
        {
            "Sid": "TranscribeMedicalAccess",
            "Effect": "Allow",
            "Action": [
                "transcribe:StartMedicalTranscriptionJob",
                "transcribe:GetMedicalTranscriptionJob"
            ],
            "Resource": "*"
        },
        {
            "Sid": "ComprehendMedicalAccess",
            "Effect": "Allow",
            "Action": [
                "comprehendmedical:DetectEntitiesV2"
            ],
            "Resource": "*"
        },
        {
            "Sid": "BedrockAccess",
            "Effect": "Allow",
            "Action": [
                "bedrock:InvokeModel"
            ],
            "Resource": "*"
        }
    ]
}
EOF

# 3. Create Policy (ignore if exists)
POLICY_ARN=$(aws iam create-policy --policy-name "$POLICY_NAME" --policy-document file:///tmp/limeai-policy.json --query 'Policy.Arn' --output text 2>/dev/null) || \
POLICY_ARN=$(aws iam list-policies --query "Policies[?PolicyName=='$POLICY_NAME'].Arn" --output text)

echo "Attaching policy $POLICY_ARN to user $USERNAME..."
aws iam attach-user-policy --user-name "$USERNAME" --policy-arn "$POLICY_ARN"

# 4. Create Access Keys
echo "Creating Access Keys..."
aws iam create-access-key --user-name "$USERNAME" > access-keys.json

echo "---------------------------------------------------"
echo "IAM User Created Successfully"
echo "Username: $USERNAME"
echo "Bucket Permission: $BUCKET_NAME"
echo ""
echo "Access keys have been saved to 'access-keys.json'."
echo "Please COPY contents to your .env file immediately and DELETE the file."
echo "---------------------------------------------------"
rm /tmp/limeai-policy.json
