/**
 * Document text extraction for AI Course Creator.
 *
 * Supports:
 * - PDF files (via pdf-parse)
 * - Word documents .docx (via mammoth)
 * - Plain text, Markdown, CSV, TSV, HTML, JSON, XML
 */

/**
 * Extract text content from an uploaded file based on its type.
 * Returns the extracted text, truncated to maxChars.
 */
export async function extractTextFromFile(
  file: File,
  maxChars = 100000
): Promise<{ text: string; pageCount?: number; error?: string }> {
  const name = file.name.toLowerCase();
  const mimeType = file.type;

  try {
    // PDF
    if (name.endsWith(".pdf") || mimeType === "application/pdf") {
      return await extractPdf(file, maxChars);
    }

    // Word (.docx)
    if (
      name.endsWith(".docx") ||
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return await extractDocx(file, maxChars);
    }

    // Plain text and text-like formats
    if (
      name.endsWith(".txt") ||
      name.endsWith(".md") ||
      name.endsWith(".csv") ||
      name.endsWith(".tsv") ||
      name.endsWith(".html") ||
      name.endsWith(".htm") ||
      name.endsWith(".json") ||
      name.endsWith(".xml") ||
      name.endsWith(".yaml") ||
      name.endsWith(".yml") ||
      name.endsWith(".rtf") ||
      mimeType.startsWith("text/")
    ) {
      const text = await file.text();
      return { text: text.slice(0, maxChars) };
    }

    // Fallback: try to read as text
    try {
      const text = await file.text();
      // Validate it's actually text (check for too many non-printable chars)
      const nonPrintable = text
        .slice(0, 1000)
        .split("")
        .filter((c) => {
          const code = c.charCodeAt(0);
          return code < 32 && code !== 9 && code !== 10 && code !== 13;
        }).length;

      if (nonPrintable > 50) {
        return {
          text: "",
          error: `Unsupported file type: ${name.split(".").pop() || "unknown"}. Supported formats: PDF, DOCX, TXT, MD, CSV, HTML, JSON, XML.`,
        };
      }

      return { text: text.slice(0, maxChars) };
    } catch {
      return {
        text: "",
        error: `Could not read file: ${file.name}. Please upload a PDF, DOCX, or text file.`,
      };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { text: "", error: `Failed to parse ${file.name}: ${message}` };
  }
}

/**
 * Extract text from a PDF file using pdf-parse
 */
async function extractPdf(
  file: File,
  maxChars: number
): Promise<{ text: string; pageCount?: number; error?: string }> {
  try {
    // Dynamic import to avoid loading pdf-parse on every request
    const { PDFParse } = await import("pdf-parse");
    const buffer = Buffer.from(await file.arrayBuffer());
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const textResult = await parser.getText();

    const fullText = textResult.text || "";
    const pageCount = textResult.pages?.length || 0;

    if (!fullText.trim()) {
      await parser.destroy();
      return {
        text: "",
        pageCount,
        error:
          "PDF appears to be scanned/image-based. Text extraction requires a text-based PDF. Consider converting it with OCR first.",
      };
    }

    await parser.destroy();
    return {
      text: fullText.slice(0, maxChars),
      pageCount,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return {
      text: "",
      error: `PDF parsing failed: ${message}. The file may be corrupted or password-protected.`,
    };
  }
}

/**
 * Extract text from a .docx file using mammoth
 */
async function extractDocx(
  file: File,
  maxChars: number
): Promise<{ text: string; error?: string }> {
  try {
    const mammoth = await import("mammoth");
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await mammoth.extractRawText({ buffer });

    if (!result.value || result.value.trim().length === 0) {
      return {
        text: "",
        error: "Word document appears to be empty or contains only images.",
      };
    }

    // Log any warnings from mammoth
    if (result.messages && result.messages.length > 0) {
      console.warn(
        "Mammoth warnings:",
        result.messages.map((m) => m.message).join("; ")
      );
    }

    return { text: result.value.slice(0, maxChars) };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return {
      text: "",
      error: `Word document parsing failed: ${message}. Note: .doc (legacy) format is not supported — please use .docx.`,
    };
  }
}

/**
 * Supported file extensions for upload validation
 */
export const SUPPORTED_DOCUMENT_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".txt",
  ".md",
  ".csv",
  ".tsv",
  ".html",
  ".htm",
  ".json",
  ".xml",
  ".yaml",
  ".yml",
];

/**
 * MIME types accepted by the file upload input
 */
export const ACCEPTED_DOCUMENT_MIMES =
  "application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,text/plain,.txt,text/markdown,.md,text/csv,.csv,text/html,.html,application/json,.json,text/xml,.xml";

/**
 * Max file size for document uploads (20 MB)
 */
export const MAX_DOCUMENT_SIZE_BYTES = 20 * 1024 * 1024;
