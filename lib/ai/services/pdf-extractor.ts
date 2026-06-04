import { getDocument } from "pdfjs-dist";

export async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  const data = new Uint8Array(buffer);
  const pdf = await getDocument({ data }).promise;

  const pageData = await Promise.all(
    Array.from({ length: pdf.numPages }, (_, i) => pdf.getPage(i + 1)),
  );
  const pagesContent = await Promise.all(
    pageData.map((page) => page.getTextContent()),
  );
  const pages = pagesContent.map((content) =>
    content.items.map((item) => ("str" in item ? item.str : "")).join(" "),
  );

  const fullText = pages.join("\n\n").trim();

  if (!fullText || fullText.length < 20) {
    throw new Error(
      "This PDF appears to be a scanned image rather than a text-based PDF. " +
      "Only text-based PDFs are supported. Please upload an image (PNG/JPEG/WebP) instead.",
    );
  }

  return fullText;
}
