import { detectPII } from "@/lib/regexUtils";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Missing text" });

  const piiTags = detectPII(text);
  res.status(200).json({ tags: piiTags });
}
