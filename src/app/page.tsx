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

type AppState = "upload" | "ocr" | "mask" | "results";

export default function Home() {
  const [step, setStep] = useState<AppState>("upload");
  const [image, setImage] = useState<string | null>(null); // base64 image
  const [redactedImage, setRedactedImage] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string>("");
  const [piiTags, setPiiTags] = useState<
    { text: string; start: number; end: number }[]
  >([]);
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const [activeTab, setActiveTab] = useState("original");

  const handleUpload = async (base64Image: string) => {
    setImage(base64Image);
    setStep("ocr");
    const text = await extractTextFromImage(base64Image, setOcrProgress);
    console.log(text);
    setOcrText(text);
    // const pii = detectPII(text);

    // setPiiTags(pii);
    // setStep("mask");
  };

  const handleMaskPII = useCallback(() => {
    setStep("ocr");

    // Simulate processing time
    setTimeout(() => {
      // In a real app, this would be the actual redacted image from your API
      setRedactedImage(
        "/placeholder.svg?height=400&width=600&text=Redacted+Document"
      );
      setStep("results");
      // setActiveTab("redacted");
    }, 3000);
  }, []);

  const handleDownload = useCallback(() => {
    if (redactedImage) {
      // In a real app, this would download the actual redacted image
      const link = document.createElement("a");
      link.href = redactedImage;
      link.download = "redacted-document.png";
      link.click();
    }
  }, [redactedImage]);

  const resetTool = useCallback(() => {
    setStep("upload");
    setImage(null);
    setRedactedImage(null);
    // setActiveTab("original");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
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
                onMaskPII={handleMaskPII}
                progress={ocrProgress}
              />
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={handleMaskPII}
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

          {step === "mask" && (
            <Card className="bg-white/50 backdrop-blur-sm shadow-lg">
              <CardContent className="p-12">
                <div className="text-center space-y-6">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Processing Your Document
                    </h3>
                    <p className="text-gray-600">
                      We're securely identifying and masking sensitive
                      information...
                    </p>
                  </div>
                  <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full animate-pulse"
                      style={{ width: "60%" }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
