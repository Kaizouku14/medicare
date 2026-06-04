export function sseJson(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export function sseError(message: string): string {
  return sseJson({ error: message });
}
