export interface PIITag {
  match: string;
  start: number;
  end: number;
  label: "AADHAAR" | "PHONE" | "EMAIL" | "DATE" | "PAN" | "UNKNOWN";
}

const PII_PATTERNS = [
  { label: "AADHAAR", regex: /\b\d{4} \d{4} \d{4}\b/g },
  { label: "PHONE", regex: /\b\d{10}\b/g },
  { label: "EMAIL", regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}\b/gi },
  { label: "DATE", regex: /\b\d{2}[\/\-]\d{2}[\/\-]\d{4}\b/g },
  { label: "PAN", regex: /\b[A-Z]{5}[0-9]{4}[A-Z]\b/g },
];

export function detectPII(text: string): PIITag[] {
  const tags: PIITag[] = [];

  for (const { label, regex } of PII_PATTERNS) {
    const matches = [...text.matchAll(regex)];
    for (const match of matches) {
      tags.push({
        match: match[0],
        start: match.index ?? 0,
        end: (match.index ?? 0) + match[0].length,
        label: label as PIITag["label"],
      });
    }
  }

  return tags;
}
