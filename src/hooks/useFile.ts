"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  upload,
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
} from "@imagekit/next";

import { authenticator } from "@/lib/imagekit/auth";

type UploadKind = "thumbnails" | "avatar" | "videos";

export const useFile = (maxSize: number, kind: UploadKind) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  // file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > maxSize) {
      setError("File too large");
      return;
    }

    setError(null);
    setFile(selectedFile);

    // video metadata (duration)
    if (selectedFile.type.startsWith("video")) {
      const video = document.createElement("video");
      const metadataUrl = URL.createObjectURL(selectedFile);

      video.preload = "metadata";
      video.src = metadataUrl;

      video.onloadedmetadata = () => {
        setDuration(
          isFinite(video.duration) && video.duration > 0
            ? Math.round(video.duration)
            : 0,
        );
        URL.revokeObjectURL(metadataUrl);
      };
    }
  };

  const uploadFile = async () => {
    if (!file) throw new Error("No file selected");

    setUploading(true);
    setProgress(0);
    setError(null);

    abortRef.current = new AbortController();

    try {
      const { signature, expire, token, publicKey } = await authenticator();

      const result = await upload({
        file,
        fileName: file.name,
        signature,
        expire,
        token,
        publicKey,
        folder: `somnium/${kind}`,
        abortSignal: abortRef.current.signal,
        onProgress: (e) => setProgress(Math.round((e.loaded / e.total) * 100)),
      });

      return result;
    } catch (err) {
      if (err instanceof ImageKitAbortError) {
        setError("Upload aborted");
      } else if (err instanceof ImageKitInvalidRequestError) {
        setError(err.message);
      } else if (err instanceof ImageKitUploadNetworkError) {
        setError("Network error");
      } else if (err instanceof ImageKitServerError) {
        setError("ImageKit server error");
      } else {
        setError("Upload failed");
      }

      throw err;
    } finally {
      setUploading(false);
    }
  };

  const abortUpload = () => {
    abortRef.current?.abort();
  };

  const resetFile = () => {
    abortUpload();
    setFile(null);
    setPreviewUrl(null);
    setDuration(0);
    setProgress(0);
    setError(null);
    setUploading(false);

    // if (inputRef.current) inputRef.current.value = "";
  };

  return {
    file,
    previewUrl,
    duration,
    progress,
    uploading,
    error,

    // refs
    inputRef,

    // actions
    handleFileChange,
    uploadFile,
    abortUpload,
    resetFile,
  };
};
