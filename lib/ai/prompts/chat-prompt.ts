import { buildPatientContext } from "@/lib/db/patients/context";
import { buildChatSystemPrompt } from "@/lib/ai/prompts/prompt-builder";
import {
  searchPatientContext,
  type SearchResult,
} from "@/lib/ai/retrieval/search-patient-context";

export async function buildSystemPrompt(
  userId: string,
  patientId: string | null,
  userMessage?: string,
): Promise<string> {
  if (!patientId) {
    return `You are MediCare AI, a compassionate medical and nutrition assistant for Filipino caregivers. You help users understand medical conditions, medications, and caregiving best practices. Always prioritize safety — if a question requires professional medical advice, say so. Be warm, clear, and practical. Use everyday Filipino-English (Taglish) when appropriate. Keep responses very concise — 2 to 3 sentences maximum.`;
  }

  try {
    const [context, searchResults] = await Promise.all([
      buildPatientContext(userId, patientId),
      userMessage
        ? searchPatientContext(patientId, userMessage)
        : Promise.resolve([]),
    ]);

    let prompt = buildChatSystemPrompt(context);

    if (searchResults.length > 0) {
      prompt += formatSearchResults(searchResults, context.patient.name);
    }

    return prompt;
  } catch {
    return `You are MediCare AI... (patient not found — use general knowledge)`;
  }
}

function formatSearchResults(
  results: SearchResult[],
  patientName: string,
): string {
  const lines = results.map((r) => {
    const label = formatSourceLabel(r.sourceType, r.refDate);
    return `${label}: ${r.content}`;
  });
  return `\n\nRelevant records for ${patientName}:\n${lines.join("\n")}\n\nUse these records when answering the user's question.`;
}

function formatSourceLabel(
  type: SearchResult["sourceType"],
  date: string,
): string {
  switch (type) {
    case "visit_note":
      return `[Visit Note — ${date}]`;
    case "document_analysis":
      return `[Document Analysis — ${date}]`;
    case "chat_history":
      return `[Chat History — ${date}]`;
  }
}
