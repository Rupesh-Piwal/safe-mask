"use client";

import type React from "react";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Shield, Loader2 } from "lucide-react";
import Image from "next/image";
import { extractTextFromImage } from "@/lib/ocrUtils";
import { detectPII } from "@/lib/regexUtils";
import { ImageUploader } from "@/components/uploader/image-uploader";
import { OCRPreview } from "@/components/ocr/ocr-processor";
import { extractMetadata } from "@/lib/llm/extractMetadata";
import MaskedImageCanvas from "@/components/canvas/masked-image-canvas";
import { mapPIITagsToBoundingBoxes } from "@/lib/maskUtils";
import { maskPIIOnImage } from "@/lib/maskPIIOnImage";
import { PIITag, RedactedBox } from "./types";

type AppState = "upload" | "ocr" | "mask" | "results";

export default function Home() {
  const [step, setStep] = useState<AppState>("upload");
  const [image, setImage] = useState<string | null>(null);
  const [redactedImage, setRedactedImage] = useState<string | null>(null);
  const [redactedBoxes, setRedactedBoxes] = useState<RedactedBox[]>([]);
  const [ocrText, setOcrText] = useState<string>("");
  const [ocrWords, setOcrWords] = useState<any[]>([]);
  const [piiTags, setPiiTags] = useState<PIITag[]>([]);
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const [activeTab, setActiveTab] = useState("original");
  const [maskedImage, setMaskedImage] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<Record<
    string,
    string
  > | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpload = async (base64Image: string) => {
    setImage(base64Image);
    setStep("ocr");
    const { text, words } = await extractTextFromImage(
      base64Image,
      setOcrProgress
    );
    console.log(text);
    setOcrText(text);
    setOcrWords(words); // ← stores words for later use in handleMask
    const pii = detectPII(text);
    console.log("🔍 Detected PII tags:", pii);
    setPiiTags(pii);
    // setStep("mask");
  };

  const handleMask = async () => {
    if (!image || !piiTags || !ocrWords) return;
    console.log(piiTags);
    console.log(ocrWords);
    setIsProcessing(true);
    try {
      // Step 1: Convert piiTags + OCR words → coordinates
      const redactedBoxes = mapPIITagsToBoundingBoxes(piiTags, ocrWords); // ← returns RedactedBox[]
      console.log(redactedBoxes);
      setRedactedBoxes(redactedBoxes);
      // Step 2: Mask image using those redaction boxes
      const masked = await maskPIIOnImage(image, redactedBoxes); // ← use redactedBoxes here
      console.log(masked);
      setMaskedImage(masked);

      // Step 3: Run LLM on OCR text to extract metadata
      // const metadata = await extractMetadata(ocrText);
      // console.log(metadata);
      // setExtractedData(metadata);

      // Step 4: Move to next view
      // setStep("results");
    } catch (error) {
      console.error("Error masking PII:", error);
    }
  };

  const handleDownload = useCallback(() => {
    if (redactedImage) {
      const link = document.createElement("a");
      link.href = redactedImage;
      link.download = "redacted-document.png";
      link.click();
    }
  }, [redactedImage]);

  // const resetTool = useCallback(() => {
  //   setStep("upload");
  //   setImage(null);
  //   setRedactedImage(null);
  //   // setActiveTab("original");
  // }, []);
  const resetTool = useCallback(() => {
    setStep("upload");
    setImage(null);
    setRedactedImage(null);
    setRedactedBoxes([]);
    setOcrText("");
    setOcrWords([]);
    setPiiTags([]);
    setExtractedData(null);
    setActiveTab("original");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Mask Sensitive Info from Documents
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload an image, and we'll automatically redact your personal data.
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* ---------IMAGE-UPLOAD--------- */}
          {step === "upload" && <ImageUploader onUpload={handleUpload} />}

          {/* ---------IMAGE-UPLOAD--------- */}
          {step === "ocr" && image && (
            <>
              <OCRPreview
                image={image}
                onMaskPII={handleMask}
                progress={ocrProgress}
              />
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={handleMask}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg shadow-md transition-all duration-200"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Mask PII
                </Button>
                <Button
                  onClick={resetTool}
                  variant="outline"
                  className="px-8 py-3 rounded-lg border-gray-300 hover:bg-gray-50 bg-transparent"
                >
                  Upload Different Image
                </Button>
              </div>
            </>
          )}

          {step === "mask" && image && (
            // <Card className="bg-white/50 backdrop-blur-sm shadow-lg">
            //   <CardContent className="p-12">
            //     <div className="text-center space-y-6">
            //       <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            //         <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            //       </div>
            //       <div>
            //         <h3 className="text-xl font-semibold text-gray-900 mb-2">
            //           Processing Your Document
            //         </h3>
            //         <p className="text-gray-600">
            //           We're securely identifying and masking sensitive
            //           information...
            //         </p>
            //       </div>
            //       <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2">
            //         <div
            //           className="bg-blue-600 h-2 rounded-full animate-pulse"
            //           style={{ width: "60%" }}
            //         ></div>
            //       </div>
            //     </div>
            //   </CardContent>
            // </Card>
            <MaskedImageCanvas
              imageSrc={image!} // base64 or URL
              redactedBoxes={redactedBoxes} // array of {x, y, width, height}
            />
          )}

          {step === "results" && image && redactedImage && (
            <Card className="bg-white/50 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Document Successfully Processed
                    </h3>
                    <p className="text-gray-600">
                      Your sensitive information has been securely redacted
                    </p>
                  </div>

                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-lg p-1">
                      <TabsTrigger
                        value="original"
                        className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      >
                        Original
                      </TabsTrigger>
                      <TabsTrigger
                        value="redacted"
                        className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      >
                        Redacted
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="original" className="mt-6">
                      <div className="flex justify-center">
                        <div className="relative max-w-md w-full">
                          <Image
                            src={image || "/placeholder.svg"}
                            alt="Original document"
                            width={400}
                            height={300}
                            className="rounded-lg shadow-md object-contain w-full h-auto"
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="redacted" className="mt-6">
                      <div className="flex justify-center">
                        <div className="relative max-w-md w-full">
                          <Image
                            src={redactedImage || "/placeholder.svg"}
                            alt="Redacted document"
                            width={400}
                            height={300}
                            className="rounded-lg shadow-md object-contain w-full h-auto"
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={handleDownload}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow-md transition-all duration-200"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Redacted Image
                    </Button>
                    <Button
                      onClick={resetTool}
                      variant="outline"
                      className="px-8 py-3 rounded-lg border-gray-300 hover:bg-gray-50 bg-transparent"
                    >
                      Process Another Document
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
