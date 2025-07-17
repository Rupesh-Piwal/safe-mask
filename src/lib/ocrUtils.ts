// lib/ocr/extractTextFromImage.ts

import Tesseract from "tesseract.js";

export async function extractTextFromImage(
  imageBase64: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const result = await Tesseract.recognize(imageBase64, "eng", {
    logger: (m) => {
      if (m.status === "recognizing text" && onProgress) {
        onProgress(Math.floor(m.progress * 100));
      }
    },
  });

  return result.data.text || "";
}
