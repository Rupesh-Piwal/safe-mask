// types.ts
export type PIITag = {
  match: string;
  start: number;
  end: number;
  entity: string;
  text: string;
  label: "AADHAAR" | "PHONE" | "EMAIL" | "DATE" | "PAN" | "UNKNOWN";
};

export type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

// RedactedBox can be the same as BoundingBox or extend it if needed
export type RedactedBox = BoundingBox;
