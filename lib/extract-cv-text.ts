import mammoth from "mammoth";

export async function extractCVText({
  buffer,
  fileType,
}: {
  buffer: Buffer;
  fileType: string;
}): Promise<string> {
  if (fileType === "application/pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return result.text || "";
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
