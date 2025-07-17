import { extractTextFromImage } from "@/lib/ocrUtils";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { imageBase64 } = req.body;
  if (!imageBase64) return res.status(400).json({ error: "Missing image" });

  try {
    const text = await extractTextFromImage(imageBase64);
    res.status(200).json({ text });
  } catch (err) {
    res.status(500).json({ error: "OCR failed" });
  }
}
