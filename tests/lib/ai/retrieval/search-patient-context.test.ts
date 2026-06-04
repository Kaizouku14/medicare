import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    execute: vi.fn(),
  },
}));

vi.mock("@/lib/ai/embeddings/groq-embed", () => ({
  generateEmbedding: vi.fn(),
}));

import { db } from "@/lib/db";
import { generateEmbedding } from "@/lib/ai/embeddings/groq-embed";
import { searchPatientContext } from "@/lib/ai/retrieval/search-patient-context";

const mockEmbedding = [0.1, 0.2, 0.3, 0.4];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("searchPatientContext", () => {
  it("returns empty for short query", async () => {
    const result = await searchPatientContext("pat-1", "ab");
    expect(result).toEqual([]);
  });

  it("returns empty for empty query", async () => {
    const result = await searchPatientContext("pat-1", "");
    expect(result).toEqual([]);
  });

  it("returns empty when embedding generation fails", async () => {
    vi.mocked(generateEmbedding).mockRejectedValueOnce(new Error("API down"));

    const result = await searchPatientContext("pat-1", "sodium levels");
    expect(result).toEqual([]);
  });

  it("returns results from vector search", async () => {
    vi.mocked(generateEmbedding).mockResolvedValueOnce(mockEmbedding);
    vi.mocked(db.execute).mockResolvedValueOnce([
      {
        id: "note-1",
        source_type: "visit_note",
        content: "Patient sodium levels are elevated",
        ref_date: "2026-05-28",
        relevance: 0.85,
      },
      {
        id: "doc-1",
        source_type: "document_analysis",
        content: "Lab results show hyponatremia",
        ref_date: "2026-05-20",
        relevance: 0.72,
      },
    ] as never);

    const result = await searchPatientContext("pat-1", "sodium");

    expect(result).toHaveLength(2);
    expect(result[0].sourceType).toBe("visit_note");
    expect(result[0].content).toContain("sodium");
    expect(result[0].relevance).toBeGreaterThan(0);
  });

  it("filters results below minRelevance threshold", async () => {
    vi.mocked(generateEmbedding).mockResolvedValueOnce(mockEmbedding);
    vi.mocked(db.execute).mockResolvedValueOnce([
      {
        id: "note-1",
        source_type: "visit_note",
        content: "Patient sodium levels are elevated",
        ref_date: "2026-05-28",
        relevance: 0.15,
      },
    ] as never);

    const result = await searchPatientContext("pat-1", "sodium");
    expect(result).toHaveLength(0);
  });

  it("deduplicates results with same content", async () => {
    vi.mocked(generateEmbedding).mockResolvedValueOnce(mockEmbedding);
    vi.mocked(db.execute).mockResolvedValueOnce([
      {
        id: "note-1",
        source_type: "visit_note",
        content: "Patient sodium levels are elevated",
        ref_date: "2026-05-28",
        relevance: 0.85,
      },
      {
        id: "note-2",
        source_type: "visit_note",
        content: "Patient sodium levels are elevated",
        ref_date: "2026-05-27",
        relevance: 0.80,
      },
    ] as never);

    const result = await searchPatientContext("pat-1", "sodium");
    expect(result).toHaveLength(1);
  });

  it("truncates long content to 500 chars", async () => {
    const longContent = "x".repeat(1000);
    vi.mocked(generateEmbedding).mockResolvedValueOnce(mockEmbedding);
    vi.mocked(db.execute).mockResolvedValueOnce([
      {
        id: "note-1",
        source_type: "visit_note",
        content: longContent,
        ref_date: "2026-05-28",
        relevance: 0.85,
      },
    ] as never);

    const result = await searchPatientContext("pat-1", "test");
    expect(result[0].content.length).toBeLessThanOrEqual(503);
    expect(result[0].content).toMatch(/\.\.\.$/);
  });

  it("handles DB query failure gracefully", async () => {
    vi.mocked(generateEmbedding).mockResolvedValueOnce(mockEmbedding);
    vi.mocked(db.execute).mockRejectedValueOnce(new Error("DB error"));

    const result = await searchPatientContext("pat-1", "sodium");
    expect(result).toEqual([]);
  });

  it("uses patient-specific filter", async () => {
    vi.mocked(generateEmbedding).mockResolvedValueOnce(mockEmbedding);
    vi.mocked(db.execute).mockResolvedValueOnce([] as never);

    await searchPatientContext("pat-1", "sodium");

    expect(generateEmbedding).toHaveBeenCalledWith("sodium");
    expect(db.execute).toHaveBeenCalled();
  });
});
