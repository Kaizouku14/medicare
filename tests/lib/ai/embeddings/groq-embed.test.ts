import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  vi.clearAllMocks();
  process.env.HF_API_KEY = "hf_test_key";
});

async function generateEmbedding(text: string): Promise<number[]> {
  const HF_API_KEY = process.env.HF_API_KEY;
  const HF_EMBED_URL =
    "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2";

  if (!HF_API_KEY) {
    throw new Error("HF_API_KEY is not configured.");
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

  const data = (await res.json()) as Array<{ embedding: number[] }>;

  if (!Array.isArray(data) || !data[0]?.embedding) {
    throw new Error("Hugging Face returned an unexpected response.");
  }

  return data[0].embedding;
}

async function generateEmbeddingSafe(text: string): Promise<number[] | null> {
  try {
    return await generateEmbedding(text);
  } catch {
    return null;
  }
}

describe("generateEmbedding", () => {
  it("calls Hugging Face API and returns embedding", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ embedding: [0.1, 0.2, 0.3] }],
    });

    const result = await generateEmbedding("test text");
    expect(result).toEqual([0.1, 0.2, 0.3]);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("huggingface.co"),
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("test text"),
      }),
    );
  });

  it("throws on missing API key", async () => {
    delete process.env.HF_API_KEY;
    await expect(generateEmbedding("test")).rejects.toThrow("HF_API_KEY");
  });

  it("throws on API error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      text: async () => "Model loading",
    });

    await expect(generateEmbedding("test")).rejects.toThrow("503");
  });

  it("throws on unexpected response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ error: "invalid" }),
    });

    await expect(generateEmbedding("test")).rejects.toThrow("unexpected response");
  });

  it("truncates long text to 4000 chars", async () => {
    const longText = "a".repeat(5000);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ embedding: [0.1] }],
    });

    await generateEmbedding(longText);
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.inputs.length).toBe(4000);
  });
});

describe("generateEmbeddingSafe", () => {
  it("returns null on failure instead of throwing", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));
    const result = await generateEmbeddingSafe("test");
    expect(result).toBeNull();
  });

  it("returns embedding on success", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ embedding: [0.5] }],
    });

    const result = await generateEmbeddingSafe("test");
    expect(result).toEqual([0.5]);
  });
});
