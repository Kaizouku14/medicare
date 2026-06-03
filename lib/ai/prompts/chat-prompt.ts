import { buildPatientContext } from "@/lib/db/patients/context";
import { buildChatSystemPrompt } from "@/lib/ai/prompts/prompt-builder";

export async function buildSystemPrompt(
  userId: string,
  patientId: string | null,
): Promise<string> {
  if (!patientId) {
    return `You are MediCare AI, a compassionate medical and nutrition assistant for Filipino caregivers. You help users understand medical conditions, medications, and caregiving best practices. Always prioritize safety — if a question requires professional medical advice, say so. Be warm, clear, and practical. Use everyday Filipino-English (Taglish) when appropriate. Keep responses very concise — 2 to 3 sentences maximum.`;
  }

  try {
    const context = await buildPatientContext(userId, patientId);
    return buildChatSystemPrompt(context);
  } catch {
    return `You are MediCare AI... (patient not found — use general knowledge)`;
  }
}
