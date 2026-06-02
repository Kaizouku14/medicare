const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export type GroqMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type GroqVisionContent =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

async function groqFetch(body: Record<string, unknown>): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured. Set it in your .env file.");
  }

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Groq API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  const content: string = data.choices?.[0]?.message?.content ?? "";

  if (!content) {
    throw new Error("Groq returned an empty response.");
  }

  return content;
}

export async function groqChat(
  messages: GroqMessage[],
  model: string,
  jsonMode: boolean,
): Promise<string> {
  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: 0.7,
    max_tokens: jsonMode ? 4096 : 2048,
  };

  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }

  return groqFetch(body);
}

export async function groqVision(
  systemPrompt: string,
  userPrompt: string,
  imageBase64: string,
  mimeType: string,
  model: string,
): Promise<string> {
  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          { type: "text", text: userPrompt },
          {
            type: "image_url",
            image_url: { url: `data:${mimeType};base64,${imageBase64}` },
          },
        ],
      },
    ],
    temperature: 0.3,
    max_tokens: 4096,
    response_format: { type: "json_object" },
  };

  return groqFetch(body);
}
