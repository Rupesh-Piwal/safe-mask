import { PIITag } from "./regexUtils";

export async function drawMaskOnImage(imageSrc: string, tags: PIITag[]): Promise<string> {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((res) => (image.onload = res));

  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context missing");

  ctx.drawImage(image, 0, 0);

  // TEMP: draw blurred box (replace with smarter region-based masking using OCR bounding boxes later)
  ctx.fillStyle = "black";
  tags.forEach((tag, index) => {
    const y = 40 + index * 30;
    ctx.fillRect(40, y, canvas.width - 80, 25);
  });

  return canvas.toDataURL();
}
