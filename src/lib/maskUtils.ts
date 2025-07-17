// lib/masking/mapPIITagsToBoundingBoxes.ts
import { PIITag, RedactedBox } from "@/app/types";
import { Word } from "tesseract.js";

export function mapPIITagsToBoundingBoxes(
  tags: PIITag[],
  words: Word[]
): RedactedBox[] {
  return tags.flatMap((tag) => {
    const tagTextLower = tag.text.toLowerCase();

    return words
      .filter((word) => {
        const wordTextLower = word.text.toLowerCase();
        return (
          wordTextLower.includes(tagTextLower) ||
          tagTextLower.includes(wordTextLower)
        );
      })
      .map((word) => {
        const { x0, y0, x1, y1 } = word.bbox;
        return {
          x: x0,
          y: y0,
          width: x1 - x0,
          height: y1 - y0,
        };
      });
  });
}
