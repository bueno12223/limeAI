#!/bin/bash
set -e

# Configuration
STACK_NAME="LimeAI-Database-Stack"
REGION=${AWS_REGION:-"us-east-1"}
DB_USER="limeai_admin"

# Generate a random password if not provided
if [ -z "$DB_PASSWORD" ]; then
    echo "Generating secure password..."
    DB_PASSWORD=$(openssl rand -base64 16 | tr -dc 'a-zA-Z0-9' | head -c 16)
fi

echo "Deploying PostgreSQL Database (RDS) to AWS ($REGION)..."
echo "   Stack Name: $STACK_NAME"
echo "   User: $DB_USER"
echo "   (This may take 5-10 minutes to provision the instance)"

# Deploy CloudFormation Stack
aws cloudformation deploy \
  --template-file infra/db-stack.yaml \
  --stack-name "$STACK_NAME" \
  --parameter-overrides \
    DBUser="$DB_USER" \
    DBPassword="$DB_PASSWORD" \
  --capabilities CAPABILITY_NAMED_IAM \
  --region "$REGION"

# Retrieve Outputs
echo "Database Provisioned!"
echo "Retrieving connection details..."

DB_ENDPOINT=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" --query "Stacks[0].Outputs[?OutputKey=='DBEndpoint'].OutputValue" --output text)
DB_PORT=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" --query "Stacks[0].Outputs[?OutputKey=='DBPort'].OutputValue" --output text)

# Construct Connection String
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_ENDPOINT:$DB_PORT/limeai_prod"

echo "---------------------------------------------------"
echo "Setup Complete!"
echo ""
echo "Database Endpoint: $DB_ENDPOINT"
echo "Connection String (Prisma):"
echo ""
echo "DATABASE_URL=\"$DATABASE_URL\""
echo ""
echo "Copy the DATABASE_URL above and add it to your:"
echo "   1. Local .env file (to test connection)"
echo "   2. Amplify Console -> App Settings -> Environment Variables"
echo "---------------------------------------------------"
