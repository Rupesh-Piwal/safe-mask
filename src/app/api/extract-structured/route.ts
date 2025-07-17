// import type { NextApiRequest, NextApiResponse } from "next";
// import OpenAI from "openai"; // or OpenRouter if you want
// const openai = new OpenAI({ apiKey: process.env.OPENROUTER_API_KEY });

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const { rawText } = req.body;
//   if (!rawText) return res.status(400).json({ error: "Missing text" });

//   const prompt = `
// You are an AI document parser. Extract structured fields from the text below:

// ${rawText}

// Return a JSON with keys like: name, date_of_birth, phone, id_number, issue_date, expiry_date, etc.
// `;

//   const completion = await openai.chat.completions.create({
//     model: "mistral:7b-instruct", // or "gpt-3.5-turbo" if using OpenAI
//     messages: [{ role: "user", content: prompt }],
//   });

//   const content = completion.choices[0]?.message?.content;
//   const json = content ? JSON.parse(content) : {};

//   res.status(200).json({ data: json });
// }

// app/api/llm/extract/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  const prompt = `
You are a helpful assistant. From the following raw OCR text, extract structured fields if possible.

Respond with a JSON object with fields like:
- name
- document_type
- issue_date
- expiry_date
- id_number
- dob
- gender
- address

OCR TEXT:
"""
${text}
"""
`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistral/mistral-7b-instruct:free",
      messages: [
        { role: "system", content: "You are an information extraction assistant." },
        { role: "user", content: prompt },
      ],
    }),
  });

  const result = await response.json();

  const metadataRaw = result.choices?.[0]?.message?.content || "{}";

  try {
    const metadata = JSON.parse(metadataRaw);
    return NextResponse.json({ metadata });
  } catch (err) {
    return NextResponse.json({ metadata: {} });
  }
}
