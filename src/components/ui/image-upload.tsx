"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  disabled?: boolean;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled,
  className,
}: ImageUploadProps) {
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        onChange(data.url);
      } catch (error) {
        console.error(error);
        toast.error("Failed to upload image");
      } finally {
        setLoading(false);
      }
    },
    [onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxFiles: 1,
    disabled: disabled || loading,
  });

  if (value) {
    return (
      <div
        className={cn(
          "relative w-full aspect-video rounded-lg overflow-hidden border border-border",
          className,
        )}
      >
        <Image src={value} alt="Upload" fill className="object-cover" />
        <Button
          type="button"
          onClick={() => {
            onChange("");
            onRemove?.();
          }}
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8"
          disabled={disabled}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors h-64",
        isDragActive
          ? "border-primary bg-primary/10"
          : "border-muted-foreground/25 hover:border-primary",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      <Input {...getInputProps()} />
      {loading ? (
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Uploading...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-muted-foreground text-center">
          <div className="bg-background rounded-full p-3 shadow-sm border">
            <Upload className="h-6 w-6" />
          </div>
          <div>
            <p className="font-medium">
              {isDragActive
                ? "Drop the image here"
                : "Click or drag image to upload"}
            </p>
            <p className="text-sm text-muted-foreground/75 mt-1">
              SVG, PNG, JPG or GIF (max. 10MB)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to make it compatible with form inputs if needed
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} />;
}
