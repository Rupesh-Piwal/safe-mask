import { BoundingBox } from "@/app/types";

export async function maskPIIOnImage(
  base64Image: string,
  boxes: BoundingBox[]
): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Failed to get canvas context");

      ctx.drawImage(image, 0, 0);

      ctx.fillStyle = "black";
      boxes.forEach(({ top, left, width, height }) => {
        ctx.fillRect(left, top, width, height);
      });

      const maskedBase64 = canvas.toDataURL("image/png");
      resolve(maskedBase64);
    };

    image.onerror = () => reject("Failed to load image");
    image.src = base64Image;
  });
}
