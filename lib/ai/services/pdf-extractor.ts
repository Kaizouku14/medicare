import { getDocument } from "pdfjs-dist";

export async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  const data = new Uint8Array(buffer);
  const pdf = await getDocument({ data }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
    pages.push(text);
  }

  const fullText = pages.join("\n\n").trim();

  if (!fullText || fullText.length < 20) {
    throw new Error(
      "This PDF appears to be a scanned image rather than a text-based PDF. " +
      "Only text-based PDFs are supported. Please upload an image (PNG/JPEG/WebP) instead.",
    );
  }

  return fullText;
}
