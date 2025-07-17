import { BoundingBox, PIITag } from "@/app/types";
import type { Word } from "tesseract.js";

export function mapPIITagsToBoundingBoxes(
  piiTags: PIITag[],
  words: Word[]
): BoundingBox[] {
  const boxes: BoundingBox[] = [];

  for (const tag of piiTags) {
    const matchedWord = words.find((word) => {
      return word.text.trim().toLowerCase() === tag.text.trim().toLowerCase();
    });

    if (matchedWord?.bbox) {
      boxes.push({
        top: matchedWord.bbox.y0,
        left: matchedWord.bbox.x0,
        width: matchedWord.bbox.x1 - matchedWord.bbox.x0,
        height: matchedWord.bbox.y1 - matchedWord.bbox.y0,
      });
    }
  }

  return boxes;
}
