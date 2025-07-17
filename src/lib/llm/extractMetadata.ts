// lib/llm/extractMetadata.ts

export async function extractMetadata(ocrText: string): Promise<Record<string, string>> {
  const res = await fetch("/api/llm/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: ocrText }),
  });

  if (!res.ok) throw new Error("Failed to extract metadata");

  const data = await res.json();
  return data.metadata;
}
