import mammoth from "mammoth";
import { extractText } from "unpdf";

async function extractPdfText(buffer: Buffer): Promise<string> {
  const data = new Uint8Array(buffer);
  const result = await extractText(data);
  return result.text.join("\n\n") || "";
}

export async function extractCVText({
  buffer,
  fileType,
}: {
  buffer: Buffer;
  fileType: string;
}): Promise<string> {
  if (fileType === "application/pdf") {
    return extractPdfText(buffer);
  }

  if (
    fileType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error(`Unsupported file type: ${fileType}`);
}
