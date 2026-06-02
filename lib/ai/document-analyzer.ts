import { type DocumentAnalysis } from "@/types/domain";
import { groqVision } from "@/lib/ai/groq-client";

const VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
const FALLBACK_MODEL = "meta-llama/llama-4-maverick-17b-128e-instruct";

function isDocumentAnalysis(v: unknown): v is DocumentAnalysis {
  if (!v || typeof v !== "object") return false;
  const obj = v as Record<string, unknown>;
  return (
    typeof obj.summary === "string" &&
    typeof obj.findings === "string" &&
    typeof obj.dietaryConsiderations === "string" &&
    Array.isArray(obj.concerns) &&
    Array.isArray(obj.extractedValues) &&
    (!obj.extractedValues.length ||
      (typeof obj.extractedValues[0]?.name === "string" &&
        typeof obj.extractedValues[0]?.value === "string"))
  );
}

const SYSTEM_PROMPT =
  "You are MediCare AI, a medical document analyst for Filipino patients. Analyze the uploaded medical document (lab result, CT scan report, ECG, or other clinical document). Return ONLY valid JSON matching the requested structure. No markdown, no code fences, no explanation.";

const USER_PROMPT = `Analyze this medical document. Return a JSON object with this exact structure:
{
  "documentType": "lab-results" | "ct-scan" | "ecg" | "other",
  "summary": "2-3 sentence plain-English summary of what this document shows",
  "findings": "Detailed clinical findings from the document",
  "extractedValues": [
    {
      "name": "Test name (e.g. Creatinine, HDL, Glucose)",
      "value": "The numeric or textual result value",
      "unit": "Unit of measurement (e.g. mg/dL, mmol/L, %)",
      "referenceRange": "Reference range from the document (e.g. 0.6-1.2)",
      "isAbnormal": true or false,
      "interpretation": "Brief note on what this means"
    }
  ],
  "concerns": ["List of clinical concerns based on abnormal values"],
  "relevantDiagnoses": ["Conditions implied by these results"],
  "dietaryConsiderations": "How these results affect dietary recommendations"
}

For non-lab documents (CT scans, ECGs), extractedValues may be empty.
Return ONLY valid JSON. No markdown, no explanation.`;

const GROQ_BASE64_LIMIT = 4 * 1024 * 1024;

export async function analyzeDocument(
  imageBuffer: ArrayBuffer,
  mimeType: string,
): Promise<DocumentAnalysis> {
  const base64 = Buffer.from(imageBuffer).toString("base64");

  if (base64.length > GROQ_BASE64_LIMIT) {
    throw new Error(
      "Image too large for Groq vision analysis. Please upload a smaller or compressed image (under 3 MB).",
    );
  }

  let lastError: Error | null = null;

  for (const model of [VISION_MODEL, FALLBACK_MODEL]) {
    try {
      const content = await groqVision(SYSTEM_PROMPT, USER_PROMPT, base64, mimeType, model);
      const parsed = JSON.parse(content);
      if (isDocumentAnalysis(parsed)) {
        return parsed;
      }
      throw new Error(
        `Response missing required fields. Keys: ${Object.keys(parsed).join(", ")}`,
      );
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (model === FALLBACK_MODEL) break;
    }
  }

  throw lastError ?? new Error("Document analysis failed.");
}
