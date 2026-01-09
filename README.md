# 🚀 LimeAI - Intelligent Medical Scribe

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/AWS-Medical_Stack-orange?style=for-the-badge&logo=amazon-aws" alt="AWS" />
  <img src="https://img.shields.io/badge/Prisma-ORM-215732?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/TypeScript-Strict_Mode-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-UI-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind" />
  
  <h3>AI-Powered Clinical Documentation System</h3>
  <p>An intelligent ecosystem that converts medical dictation into structured, HIPAA-ready SOAP notes using AWS specialized clinical AI.</p>
</div>

<br />

## 📖 Table of Contents
1.  [Project Vision](#-project-vision)
2.  [Architecture & Data Flow](#-architecture--data-flow)
3.  [The Scribe Pipeline](#-the-scribe-pipeline)
4.  [Key Technical Decisions](#-key-technical-decisions)
5.  [Security & Compliance](#-security--hipaa-compliance)
6.  [Setup & Installation](#-setup--configuration)
7.  [Deployment](#-deployment-on-aws-amplify)

---

## 🎯 Project Vision

LimeAI is designed to eliminate the **"administrative burden"** of healthcare. The primary goal is to allow physicians to focus on the patient by automating the creation of **Subjective, Objective, Assessment, and Plan (SOAP)** notes. By combining deterministic entity extraction with generative clinical synthesis, we ensure that every note is accurate, professional, and useful for clinical decision support.

---

## 🏗 Architecture & Data Flow

The application follows a **Vertical Slice Architecture**, where each feature is self-contained but shares a robust business logic layer.

### Technical Data Flow
```mermaid
graph TD
    A[Voice Input/Upload] --> B(AWS Transcribe Medical)
    B --> C{Raw Transcript}
    C --> D[AWS Comprehend Medical]
    D --> E[Entity Extraction Engine]
    E -- "Medications (Dosage/Freq)" --> F[Bedrock Synthesis]
    E -- "Conditions (ICD-10 style)" --> F
    C -- "Narrative Context" --> F
    F --> G{SOAP Generator}
    G -- "JSON Formatting" --> H[Prisma / PostgreSQL]
    H --> I[Clinician Review UI]
```

---

## 🧬 The Scribe Pipeline

Our pipeline is engineered for high-stakes clinical environments, ensuring that data is processed with both speed and medical precision.

### 1. Medical-Grade Transcription
We utilize **Amazon Transcribe Medical** with the following configuration:
*   **Specialty:** `PRIMARYCARE`
*   **Type:** `DICTATION`
*   **Features:** High-accuracy speech-to-text specifically trained on medical terminology, handling complex pharmaceutical names and anatomical terms that generic ASR models (like Whisper base) typically fail to recognize.

### 2. Clinical Entity Extraction (NER)
**Amazon Comprehend Medical** acts as our clinical brain. It identifies:
*   **Medications:** Names, dosage, route, frequency, and strength.
*   **Medical Conditions:** Diagnoses, symptoms, and anatomical references.
*   **PHI:** Identification of Protected Health Information for security flagging.

### 3. Generative Synthesis (The AI Scribe)
We leverage **Claude 3** (via **Amazon Bedrock**) as our synthesis engine.
*   **Ground Truth Injection:** We provide the LLM with the raw transcript *plus* the extracted entities as "Ground Truth" to prevent hallucinations.
*   **Contextual Reasoning:** The model is prompted with a clinical persona to structure the narrative sections (Subjective/Assessment) while maintaining the deterministic facts found by Comprehend Medical.

---

## 💡 Key Technical Decisions

### 1. Deterministic Extraction vs. Pure Generative AI
*   **Decision:** We do not rely solely on an LLM to find medications.
*   **Reasoning:** LLMs can "hallucinate" dosages or frequencies if the audio is slightly unclear. By using Comprehend Medical first, we get a list of entities with a **Confidence Score**.
*   **Impact:** High-confidence AWS entities are prioritized, ensuring that the critical "Plan" section of the SOAP note is based on clinical fact, not probabilistic guessing.

### 2. Logic Encapsulation (Business Layer)
*   **Decision:** All AI logic is stored in a dedicated `business/` directory instead of being coupled with UI actions.
*   **Reasoning:** This allows the system to be unit-tested in isolation from the Next.js request/response cycle and simplifies migration to a different backend architecture (e.g., AWS Lambda) if needed.

### 3. Asynchronous UX Strategy
*   **Decision:** Implementation of client-side polling with optimistic UI updates.
*   **Reasoning:** Medical transcription takes time (approx. 30s-1m for average consultations). The UI provides immediate feedback while the background worker monitors the AWS Job status.

---

## 🛡 Security & HIPAA Compliance

LimeAI adheres to the highest standards of medical data privacy.

*   **HIPAA Eligibility:** We exclusively use AWS services that are part of the AWS BAA (Business Associate Addendum).
*   **Encryption at Rest:** PostgreSQL (RDS) and S3 buckets use AES-256 encryption.
*   **Encryption in Transit:** All data flows through HTTPS/TLS 1.2+ protocols.
*   **Zero-Retention Policy:** We configure Bedrock models to ensure that input data is not used to train foundation models, maintaining strict data sovereignty.
*   **Auditability:** Prepared for CloudTrail integration to provide a full audit log of clinical record access.

---

## ⚠️ Current Limitations & Trade-offs

Transparancy is key. This project is a **"Vertical Slice" technical demo**, intentionally opting for simplicity over massive scalability in certain areas.

| Limitation | Impact | Context & Solution |
| :--- | :--- | :--- |
| **Max File Size: 4.5MB** | Audio files larger than ~4.5MB will fail to upload. | **Why?** We are uploading files via Vercel/Next.js Server Actions, which have strict body size limits.<br>**Production Fix:** In a real app, we would use **Presigned URLs** to upload directly to S3 from the client, bypassing the server entirely. We skipped this to avoid the complexity of a signed-url handshake for this MVP. |
| **Processing Time** | Transcription + AI Synthesis takes ~30-60 seconds. | **Why?** Medical ASR is computationally expensive. The UI currently "blocks" or creates a pending state.<br>**Production Fix:** Use Webhooks (Amazon EventBridge) to notify the frontend when the job is done, rather than making the user wait or poll. |
| **Single Speaker** | Pipeline assumes one clear voice (Doctor). | **Why?** While AWS supports Diarization (Speaker A vs B), enabling it adds complexity to the prompt engineering (who said what?). For this demo, we focused on perfect clinical extraction of the *Doctor's* dictation. |

---

## 🛠 Setup & Configuration

### Prerequisites
*   **Node.js:** 18.x or higher.
*   **AWS Credentials:** Access to Transcribe Medical, Comprehend Medical, and Bedrock.
*   **Database:** PostgreSQL.

### Installation

1.  **Clone the repo:**
    ```bash
    git clone https://github.com/youruser/lime-ai.git
    cd lime-ai
    ```

2.  **Environment Setup:**
    Create a `.env` file in the root:
    ```bash
    DATABASE_URL="postgresql://user:password@localhost:5432/limeai"
    
    # AWS Credentials (see Deployment section for automated setup)
    AWS_REGION="us-east-1"
    AWS_ACCESS_KEY_ID="AKIA..."
    AWS_SECRET_ACCESS_KEY="..."
    AWS_S3_BUCKET="limeai-artifacts"
    ```

3.  **Initialize Database:**
    ```bash
    npx prisma generate
    npx prisma db push
    ```

4.  **Start Development:**
    ```bash
    npm run dev
    ```

---

## 📡 API Reference

#### Internal Server Actions
*   `createNote(formData: FormData)`
    *   The main orchestrator for the scribe pipeline.
    *   **Inputs:** `audioFile`: File, `patientId`: string.
    *   **Output:** `Promise<{ success: boolean, noteId?: string, error?: string }>`

*   `syncClinicalData(noteId: string)`
    *   Force a re-run of the Comprehend/Bedrock pipeline if the transcript is manually edited by the doctor.

---

## ⚙️ Automated Setup Scripts

We have provided a suite of bash scripts to automate the provisioning of all necessary AWS infrastructure.
**Run them in this order:**

### 1. `scripts/deploy-db.sh` (Infrastructure)
*   **Purpose:** Provisions a **PostgreSQL RDS** instance (Free Tier eligible) with a dedicated VPC and public access.
*   **Output:** `DATABASE_URL` (needed for Prisma and App Environment).

### 2. `scripts/setup-storage.sh` (S3)
*   **Purpose:** Creates a private **S3 Bucket** for storing audio files and sets up the necessary **CORS** rules for browser uploads.
*   **Output:** `LIME_AWS_S3_BUCKET` name.

### 3. `scripts/setup-iam.sh` (Security)
*   **Purpose:** Creates a dedicated **IAM Service User** (`lime-ai-service-user`) with a restricted policy.
*   **Permissions:** Grants access *only* to the specific S3 bucket created above, plus Transcribe Medical, Comprehend Medical, and Bedrock.
*   **Output:** `LIME_AWS_ACCESS_KEY_ID` and `LIME_AWS_SECRET_ACCESS_KEY` (saved to `access-keys.json`).

---

## ☁️ Deployment on AWS Amplify

This project is configured for **AWS Amplify Gen 2** (Hosting) and **Amazon RDS** (Database).

### 1. Provision Infrastructure
Run the three scripts mentioned in the **[Automated Setup Scripts](#-automated-setup-scripts)** section above.
Collect your:
*   `DATABASE_URL`
*   `AWS_S3_BUCKET`
*   `AWS_ACCESS_KEY_ID`
*   `AWS_SECRET_ACCESS_KEY`

### 2. Connect to Amplify Console
1.  Push your code to a Git repository.
2.  Log in to the **AWS Amplify Console**.
3.  Click **"Create new app"** -> **"GitHub"**.
4.  **Build Settings**: Amplify should automatically detect the `amplify.yml` file in the root.

### 4. Environment Variables
In the Amplify Console, go to **App settings** -> **Environment variables** and add:

| Variable | Value |
| :--- | :--- |
| `DATABASE_URL` | *(Paste the URL from Step 2 output)* |
| `LIME_AWS_ACCESS_KEY_ID` | *(Your dedicated user key from Step 1)* |
| `LIME_AWS_SECRET_ACCESS_KEY` | *(Your dedicated user secret from Step 1)* |
| `LIME_AWS_REGION` | `us-east-1` |
| `LIME_AWS_S3_BUCKET` | *(Your S3 bucket name)* |

---

## 🚀 Future Roadmap

*   **Multi-Speaker Diarization:** Integrating `ShowSpeakerLabels` to distinguish between Doctor, Patient, and Caregiver during live consultations.
*   **ICD-10 Coding:** Automatic suggestion of billing codes based on the Assessment section.
*   **EHR Interoperability:** Support for FHIR (Fast Healthcare Interoperability Resources) to push notes directly to Epic or Cerner.
*   **Offline Support:** Local recording with background sync for hospital areas with poor connectivity.

---

<div align="center">
  <small>Built with ❤️ by Jesus Berrio</small>
</div>