type SSECallback = (event: Record<string, unknown>) => void;

export function sseJson(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export function sseError(message: string): string {
  return sseJson({ error: message });
}

async function processChunk(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onEvent: SSECallback,
  buffer: string,
  decoder: TextDecoder,
): Promise<void> {
  const { done, value } = await reader.read();
  if (done) return;

  let buf = buffer + decoder.decode(value, { stream: true });
  const lines = buf.split("\n");
  buf = lines.pop() ?? "";

  for (const line of lines) {
    if (!line.startsWith("data: ")) continue;
    try {
      onEvent(JSON.parse(line.slice(6)));
    } catch {
      // skip malformed events
    }
  }

  return processChunk(reader, onEvent, buf, decoder);
}

export function readSSEStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onEvent: SSECallback,
): Promise<void> {
  return processChunk(reader, onEvent, "", new TextDecoder());
}
