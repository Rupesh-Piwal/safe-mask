import Tesseract from "tesseract.js";

export async function extractTextFromImage(
  imageBase64: string,
  onProgress?: (percent: number) => void
): Promise<{ text: string; words: Tesseract.Word[] }> {
  const result = await Tesseract.recognize(imageBase64, "eng", {
    logger: (m) => {
      if (m.status === "recognizing text" && onProgress) {
        onProgress(Math.floor(m.progress * 100));
      }
    },
  });

  const text = result.data.text || "";

  // 👇 Force TypeScript to accept this even if 'words' is not in Page type
  const words = ((result.data as any).words as Tesseract.Word[]) || [];

  return { text, words };
}
