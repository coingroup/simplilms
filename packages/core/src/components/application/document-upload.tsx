"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@simplilms/ui";
import { uploadDocument } from "../../actions/application-form";
import {
  MAX_FILE_SIZE_MB,
  ACCEPTED_FILE_EXTENSIONS,
} from "../../lib/citizenship";
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface DocumentUploadProps {
  prospectId: string;
  onUploadComplete: (path: string) => void;
  currentPath?: string;
  label?: string;
}

export function DocumentUpload({
  prospectId,
  onUploadComplete,
  currentPath,
  label = "Upload Document",
}: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("prospectId", prospectId);

      const result = await uploadDocument(formData);

      setIsUploading(false);

      if (result.success && result.path) {
        setUploadedFileName(file.name);
        onUploadComplete(result.path);
      } else {
        setError(result.error || "Upload failed");
      }
    },
    [prospectId, onUploadComplete]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleRemove = () => {
    setUploadedFileName(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const hasFile = uploadedFileName || currentPath;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">{label}</p>

      {hasFile && !isUploading ? (
        <div className="flex items-center gap-3 p-3 rounded-md border border-green-200 bg-green-50">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-900 truncate">
              {uploadedFileName || "Document uploaded"}
            </p>
            <p className="text-xs text-green-700">Uploaded successfully</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
            ${
              isDragging
                ? "border-[#F26822] bg-orange-50"
                : "border-gray-300 hover:border-gray-400"
            }
            ${isUploading ? "pointer-events-none opacity-60" : ""}
          `}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={ACCEPTED_FILE_EXTENSIONS.join(",")}
            onChange={handleFileSelect}
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 text-[#F26822] animate-spin" />
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">
                  <span className="text-[#F26822] font-medium">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, JPG, or PNG (max {MAX_FILE_SIZE_MB} MB)
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <p className="text-xs">{error}</p>
        </div>
      )}
    </div>
  );
}
