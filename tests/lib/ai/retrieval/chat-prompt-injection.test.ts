import { describe, it, expect } from "vitest";

type SearchResult = {
  id: string;
  sourceType: "visit_note" | "document_analysis" | "chat_history";
  content: string;
  refDate: string;
  relevance: number;
};

function formatSourceLabel(type: SearchResult["sourceType"], date: string): string {
  switch (type) {
    case "visit_note":
      return `[Visit Note — ${date}]`;
    case "document_analysis":
      return `[Document Analysis — ${date}]`;
    case "chat_history":
      return `[Chat History — ${date}]`;
  }
}

function formatSearchResults(results: SearchResult[], patientName: string): string {
  const lines = results.map((r) => {
    const label = formatSourceLabel(r.sourceType, r.refDate);
    return `${label}: ${r.content}`;
  });
  return `\n\nRelevant records for ${patientName}:\n${lines.join("\n")}\n\nUse these records when answering the user's question.`;
}

describe("formatSearchResults", () => {
  const results: SearchResult[] = [
    {
      id: "1",
      sourceType: "visit_note",
      content: "Sodium levels elevated",
      refDate: "2026-05-28",
      relevance: 0.85,
    },
    {
      id: "2",
      sourceType: "document_analysis",
      content: "Hyponatremia detected",
      refDate: "2026-05-20",
      relevance: 0.72,
    },
    {
      id: "3",
      sourceType: "chat_history",
      content: "Q: What about potassium?",
      refDate: "2026-05-25",
      relevance: 0.60,
    },
  ];

  it("formats all result types correctly", () => {
    const output = formatSearchResults(results, "Juan");
    expect(output).toContain("[Visit Note — 2026-05-28]");
    expect(output).toContain("[Document Analysis — 2026-05-20]");
    expect(output).toContain("[Chat History — 2026-05-25]");
    expect(output).toContain("Sodium levels elevated");
    expect(output).toContain("Hyponatremia detected");
    expect(output).toContain("Q: What about potassium?");
    expect(output).toContain("Relevant records for Juan");
    expect(output).toContain("Use these records when answering");
  });

  it("produces empty block for empty results", () => {
    const output = formatSearchResults([], "Juan");
    expect(output).toContain("Relevant records for Juan");
    expect(output).toContain("Use these records when answering");
    expect(output).not.toContain("[");
  });

  it("formats single result", () => {
    const output = formatSearchResults(
      [{ id: "1", sourceType: "visit_note", content: "Test", refDate: "2026-01-01", relevance: 0.9 }],
      "Maria",
    );
    expect(output).toContain("[Visit Note — 2026-01-01]");
    expect(output).toContain("Relevant records for Maria");
  });
});
