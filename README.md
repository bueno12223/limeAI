# LimeAI - Intelligent Medical Scribe

<div align="center">
  <h3>AI-Powered Clinical Documentation System</h3>
  <p>Transforms raw medical dictation into structured, professional SOAP notes using specialized AWS Medical Services.</p>
</div>

---

## 🚀 Project Overview

LimeAI is a high-performance medical scribe application designed to reduce administrative burden for healthcare professionals. Unlike generic transcription tools, LimeAI leverages **AWS Transcribe Medical** and **Comprehend Medical** to ensure clinical accuracy, correct spelling of complex drug names, and structured extraction of medical entities.

## 💡 Key Technical Decisions made

### 1. Specialized Services vs. Generic LLMs
**Decision:** We chose **AWS Transcribe Medical** and **Comprehend Medical** over generic models like Whisper or pure ChatGPT wrappers.
*   **Why?** Medical ASR (Automatic Speech Recognition) requires distinct vocabulary training. Generic models often struggle with terms like "nitrofurantoin" or "dysuria." AWS's specialized models provide higher zero-shot accuracy for clinical terms.
*   **Safety:** We use **Comprehend Medical** to extract structured data (Medications, Dosages) deterministically, rather than relying solely on an LLM which might hallucinate a dosage. Generative AI (Bedrock/Claude 3) is used *strictly* for formatting the narrative Subjective/Assessment sections, minimizing risk.

### 2. Quality > Quantity (The "Vertical Slice")
**Decision:** Instead of building 10 half-baked features, we focused on perfecting the **Core Loop**: `Audio Input -> Transcription -> Entity Extraction -> SOAP Generation`.
*   **Result:** The application handles real-world complexity (e.g., stopping/starting recording, handling asynchronous AWS jobs, error states) robustly, rather than having many brittle features.

### 3. "Readability is a Feature"
**Decision:** The codebase avoids excessive abstraction layers, "hexagonal" boilerplate, or deeply nested helpers.
*   **Why?** In a rapid development cycle or a technical interview, the goal is clarity. A reviewer should be able to read `app/actions/scribe.ts` and understand the entire data flow in one sitting without jumping through 10 files. Logic is colocated where it makes sense.

### 4. Pragmatic Authentication & Security
**Decision:** The application uses centralized AWS credentials (`AWS_ACCESS_KEY_ID`) for backend operations rather than individual IAM federation per user.
*   **Trade-off:** In a production environment, we would implement **AWS Cognito** for user pools and identity federation. For this MVP, a service-account pattern simplifies the architecture while maintaining security best practices (env vars, no hardcoded keys).

### 5. Developer Experience (DX) & Non-Technical Stakeholders
**Decision:** We moved database seeding from the CLI to the UI.
*   **Why?** It allows non-technical stakeholders (Product Managers, Designers) to "hydrate" the application with realistic demo data immediately upon opening it, without needing to know what a terminal is.

---

## 🏗 Architecture & Tech Stack

This project follows a clean, modern stack optimized for type safety and performance.

*   **Framework:** Next.js 14 (App Router)
*   **Database:** PostgreSQL (via Prisma ORM)
*   **Styling:** Tailwind CSS + Shadcn/UI
*   **Documentation:** Automated Markdown Artifacts

### AWS Cloud Integration
*   **Transcribe Medical:** High-fidelity speech-to-text.
*   **Comprehend Medical:** Named Entity Recognition (NER) for Drugs/Conditions.
*   **Bedrock (Claude 3 Haiku):** Clinical summarization and SOAP formatting.
*   **S3:** Secure storage for audio artifacts and transcript logs.

---

## 🛠 Setup & Installation

### Prerequisites
*   Node.js 18+
*   Reference to an AWS Account with permissions for Transcribe, Comprehend, and Bedrock.
*   PostgreSQL Database URL.

### Step-by-Step

1.  **Clone the Repository**
    ```bash
    git clone <repository-url>
    cd lime-health-ai
    ```

2.  **Environment Variables**
    Create a `.env` file in the root directory:
    ```bash
    # Database
    DATABASE_URL="postgresql://..."

    # AWS Credentials
    AWS_REGION="us-east-1"
    AWS_ACCESS_KEY_ID="your_access_key"
    AWS_SECRET_ACCESS_KEY="your_secret_key"
    AWS_S3_BUCKET="your_bucket_name"
    ```

3.  **Install Dependencies**
    ```bash
    npm install
    ```

4.  **Database Setup**
    Push the schema to your database (this will also generate the Prisma client):
    ```bash
    npx prisma db push
    ```

5.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:3000`.

---

## 📡 API Documentation

### Core Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/notes` | Primary entry point. Uploads audio/text, initiates transcription job. |
| **GET** | `/api/stats` | Returns dashboard metrics (Patient count, Notes processed). |
| **GET** | `/api/patients/count` | Utility for seeding check. |

### Server Actions
*   `createNote(formData)`: The main orchestrator. It uploads the file to S3, triggers AWS Transcribe, waits for completion (synchronously for this MVP version), runs Entity Extraction, and calls Bedrock for SOAP synthesis.

---

## 🔬 Technical Deep Dive

### The "Scribe" Pipeline
I designed the pipeline to be deterministic where accuracy matters, and generative where narrative flow matters.

1.  **Input**: Raw Audio (User's voice).
2.  **Transcription (AWS Transcribe Medical)**:
    *   I explicitly configured this service with `Type: "DICTATION"` and `Specialty: "PRIMARYCARE"`.
    *   This ensures high accuracy for medical terms (e.g., "hyperlipidemia", "otitis media") that standard models miss.
3.  **Entity Extraction (AWS Comprehend Medical)**:
    *   Before sending text to an LLM, I pass it through Comprehend Medical.
    *   **Why?** It identifies medications (e.g., "Ibuprofen 400mg"), dosages, and diagnoses with a specific **Confidence Score**.
    *   This allows the UI to show a "Confidence Badge" (e.g., 98% acc), giving the doctor trust in the data.
4.  **Generative Synthesis (Bedrock - Claude 3)**:
    *   Finally, I inject the *Raw Transcript* + *Structured Entities* into a carefully crafted prompt for Claude 3.
    *   **Prompt Strategy**: "You are a Scribe. Use the extracted entities as ground truth. Format the Subjective section based on the patient's history..."
    *   **Output**: A clean, JSON-formatted SOAP note ready for the database.

---

## 🚀 Future Roadmap & Scalability

While this MVP focuses on a "Vertical Slice" of quality, here is how I would scale it for a production hospital environment:

### 1. Robust Event-Driven Architecture
Currently, the app waits for transcription to finish. In production, I would implement:
*   **S3 Event Notifications**: Trigger a Lambda function when a transcript lands in the output bucket.
*   **SQS Dead Letter Queues**: To handle failures (e.g., if Transcribe fails) with automatic retries, ensuring no patient data is ever lost.
*   **Webhooks**: Instead of polling, the backend would expose a webhook endpoint to receive real-time status updates.

### 2. Multi-Speaker Diarization
*   **Capability**: AWS Transcribe Medical natively supports `ShowSpeakerLabels`.
*   **Implementation**: I could easily enable this flag to distinguish between "Speaker 0" (Doctor), "Speaker 1" (Mother), and "Speaker 2" (Child).
*   **UseCase**: This would allow generating more nuanced notes, e.g., "Mother reports child has fever" vs "Patient denies pain."
*   **Current Decision**: For simplicity (and to ensure perfect formatting for this demo), I restricted the input to **Monologues (Dictation)**, but the infrastructure is ready for multi-speaker upgrade.

### 3. Archive & Compliance
*   **S3 Lifecycle Policies**: Automatically move recordings to **Glacier** after 30 days for cost savings.
*   **Audit Logging**: Implement CloudTrail to track who accessed which patient record (HIPAA requirement).

---

## 🧠 Assumptions & Shortcuts

1.  **Single Speaker Assumption:** The system is currently optimized for **Medical Dictation** (single doctor speaking). While AWS supports Speaker Diarization, we enforced single-channel processing to maximize the accuracy of the "Assessment & Plan" sections for this version.
2.  **Synchronous Processing:** To provide immediate feedback in the UI, the `createNote` action waits for the transcription to finish. In a high-volume production app, this would be decoupled into an Event-Driven architecture (SQS/Lambda) with Webhooks.
3.  **Data Retention:** Audio files are processed and stored in S3, but we do not currently implement a Lifecycle Policy to archive/delete old recordings.

---

<div align="center">
  <small>Built with ❤️ by Jesus Berrio</small>
</div>