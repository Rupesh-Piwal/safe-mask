import { BoundingBox, PIITag } from "@/app/types";
import type { Word } from "tesseract.js";

export function mapPIITagsToBoundingBoxes(
  piiTags: PIITag[],
  words: Word[]
): BoundingBox[] {
  return piiTags.flatMap(tag => {
    const tagText = tag.text.trim().toLowerCase();
    return words
      .filter(word => {
        const wordText = word.text.trim().toLowerCase();
        return wordText.includes(tagText) || tagText.includes(wordText);
      })
      .map(word => ({
        x: word.bbox.x0,
        y: word.bbox.y0,
        width: word.bbox.x1 - word.bbox.x0,
        height: word.bbox.y1 - word.bbox.y0
      }));
  });
}