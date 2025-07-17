// components/MaskedImageCanvas/index.tsx

"use client";

import { RedactedBox } from "@/app/types";
import React, { useEffect, useRef } from "react";



interface MaskedImageCanvasProps {
  imageSrc: string;
  redactedBoxes: RedactedBox[];
}

const MaskedImageCanvas: React.FC<MaskedImageCanvasProps> = ({
  imageSrc,
  redactedBoxes,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!imageSrc || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = imageSrc;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      redactedBoxes.forEach(({ x, y, width, height }) => {
        ctx.fillStyle = "black";
        ctx.fillRect(x, y, width, height);
      });
    };
  }, [imageSrc, redactedBoxes]);

  return (
    <div className="overflow-auto rounded-md border shadow-sm w-full max-w-[95vw]">
      <canvas ref={canvasRef} className="w-full h-auto" />
    </div>
  );
};

export default MaskedImageCanvas;
