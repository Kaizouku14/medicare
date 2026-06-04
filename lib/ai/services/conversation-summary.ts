import { groqChat } from "@/lib/ai/groq-client";

export async function summarizeConversation(
  messages: Array<{ role: string; content: string }>,
): Promise<string> {
  const transcript = messages
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");

  const content = await groqChat(
    [
      {
        role: "system",
        content:
          "You are a medical conversation summarizer. Condense the following chat transcript into 2-3 sentences capturing key medical details, dietary advice given, patient concerns, and decisions made. Omit greetings and small talk.",
      },
      {
        role: "user",
        content: `Summarize this conversation:\n\n${transcript}`,
      },
    ],
    "llama-3.1-8b-instant",
    false,
  );

  return content.trim();
}
