"use client";

import type React from "react";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download, Shield, FileImage, Loader2 } from "lucide-react";
import Image from "next/image";

type AppState = "upload" | "preview" | "processing" | "results";

export default function Home() {
  const [state, setState] = useState<AppState>("upload");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [redactedImage, setRedactedImage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState("original");

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((file) => file.type.startsWith("image/"));

    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setState("preview");
      };
      reader.readAsDataURL(imageFile);
    }
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadedImage(e.target?.result as string);
          setState("preview");
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const handleMaskPII = useCallback(() => {
    setState("processing");

    // Simulate processing time
    setTimeout(() => {
      // In a real app, this would be the actual redacted image from your API
      setRedactedImage(
        "/placeholder.svg?height=400&width=600&text=Redacted+Document"
      );
      setState("results");
      setActiveTab("redacted");
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
    setState("upload");
    setUploadedImage(null);
    setRedactedImage(null);
    setActiveTab("original");
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
          {state === "upload" && (
            <Card className="border-2 border-dashed border-gray-200 bg-white/50 backdrop-blur-sm shadow-lg">
              <CardContent className="p-8">
                <div
                  className={`relative rounded-xl border-2 border-dashed transition-all duration-200 p-12 text-center ${
                    isDragOver
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-300 bg-gray-50/50 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Drop your document here
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Supports Aadhaar cards, ID cards, and other documents
                      </p>
                      <p className="text-sm text-gray-500 mb-6">
                        PNG, JPG, JPEG up to 10MB
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        onClick={() =>
                          document.getElementById("file-upload")?.click()
                        }
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition-all duration-200"
                      >
                        <FileImage className="w-4 h-4 mr-2" />
                        Choose File
                      </Button>
                      <span className="text-gray-500 self-center">
                        or drag and drop
                      </span>
                    </div>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {state === "preview" && uploadedImage && (
            <Card className="bg-white/50 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Document Preview
                    </h3>
                    <p className="text-gray-600">
                      Review your document before masking
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <div className="relative max-w-md w-full">
                      <Image
                        src={uploadedImage || "/placeholder.svg"}
                        alt="Uploaded document"
                        width={400}
                        height={300}
                        className="rounded-lg shadow-md object-contain w-full h-auto"
                      />
                    </div>
                  </div>

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
                </div>
              </CardContent>
            </Card>
          )}

          {state === "processing" && (
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

          {state === "results" && uploadedImage && redactedImage && (
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
                            src={uploadedImage || "/placeholder.svg"}
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
