export function parseInstructions(instructions: string): string[] {
  const isNumbered = /^\d+\.\s/.test(instructions);

  if (!isNumbered) {
    return instructions
      .split(". ")
      .filter(Boolean)
      .map((s) => s.trim())
      .map((s) => (s.endsWith(".") ? s : `${s}.`));
  }

  return instructions
    .split(". ")
    .filter(Boolean)
    .map((s) => s.replace(/^\d+\s*/, "").trim())
    .filter(Boolean)
    .map((s) => (s.endsWith(".") ? s : `${s}.`));
}
