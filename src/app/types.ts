// types.ts
export interface PIITag {
  type: string;
  text: string;
  value: string;
  startIndex: number;
  endIndex: number;
  confidence: number;
  label?: "AADHAAR" | "PHONE" | "EMAIL" | "DATE" | "PAN" | "UNKNOWN";
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RedactedBox extends BoundingBox {
  // Can add additional redaction-specific properties if needed
}