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
