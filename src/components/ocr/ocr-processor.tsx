"use client";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Progress } from "../ui/progress";

interface OCRPreviewProps {
  image: string;
  onMaskPII: () => void;
  progress: number | null;
}

export const OCRPreview = ({ image, progress }: OCRPreviewProps) => {
    const isComplete = progress === 100;
  return (
    <Card className="bg-white/50 backdrop-blur-sm shadow-lg">
      <CardContent className="p-6 space-y-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground text-center">
            {isComplete
              ? "✅ Document extracted successfully!"
              : "We're extracting text from your document…"}
          </p>
        </div>

        <div className="flex justify-center">
          <Image
            src={image}
            alt="Uploaded document"
            width={400}
            height={300}
            className="rounded-lg shadow-md object-contain"
          />
        </div>

        <div className="space-y-2 max-w-[300px] mx-auto">
          <Progress
            value={progress}
            className="h-3 w-full overflow-hidden rounded-full bg-muted
          [&>div]:bg-gradient-to-r 
          [&>div]:from-green-400 
          [&>div]:to-emerald-600
          [&>div]:transition-all 
          [&>div]:duration-700 
          [&>div]:ease-in-out"
          />
          <p className="text-sm text-center text-gray-500">{progress}%</p>
        </div>
      </CardContent>
    </Card>
  );
};
