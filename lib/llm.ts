import { InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { bedrockClient } from "@/lib/aws-clients";

export async function generateSOAPContent(prompt: string): Promise<string> {
    try {
        console.log("Attempting to generate SOAP with AWS Bedrock...");
        return await invokeBedrock(prompt);
    } catch (bedrockError) {
        console.warn("AWS Bedrock failed, failing over to Google Gemini...", bedrockError);
        try {
            return await invokeGemini(prompt);
        } catch (geminiError) {
            console.error("All AI models failed.", geminiError);
            throw new Error("Failed to generate SOAP note from both Bedrock and Gemini.");
        }
    }
}

async function invokeBedrock(prompt: string): Promise<string> {

    const payload = {
        inputText: prompt,
        textGenerationConfig: {
            maxTokenCount: 2048,
            stopSequences: [],
            temperature: 0,
            topP: 1
        }
    };

    const command = new InvokeModelCommand({
        modelId: "amazon.nova-micro-v1:0",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(payload),
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    if (responseBody.results && responseBody.results[0]) {
        return responseBody.results[0].outputText;
    }
    throw new Error("Unexpected Bedrock response format");
}

async function invokeGemini(prompt: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not defined");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 2048,
            }
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
    }

    throw new Error("Unexpected Gemini response format");
}
