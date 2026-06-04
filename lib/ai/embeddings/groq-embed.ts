const HF_API_KEY = process.env.HF_API_KEY;
const HF_EMBED_URL =
  "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2";

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!HF_API_KEY) {
    throw new Error(
      "HF_API_KEY is not configured. Get a free token at https://huggingface.co/settings/tokens",
    );
  }

  const truncated = text.length > 4000 ? text.slice(0, 4000) : text;

  const res = await fetch(HF_EMBED_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${HF_API_KEY}`,
    },
    body: JSON.stringify({ inputs: truncated }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Hugging Face API error (${res.status}): ${text}`);
  }

  const data = (await res.json()) as Array<{ embedding: number[] }> | { error: string };

  if (!Array.isArray(data) || !data[0]?.embedding) {
    throw new Error("Hugging Face returned an unexpected response.");
  }

  return data[0].embedding;
}

export async function generateEmbeddingSafe(text: string): Promise<number[] | null> {
  try {
    return await generateEmbedding(text);
  } catch {
    return null;
  }
}
