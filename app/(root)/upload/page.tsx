"use client";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import FileInput from "@/components/FileInput";
import FormField from "@/components/FormField";
import { useFileInput } from "@/hooks/useFileInput";
import { MAX_THUMBNAIL_SIZE, MAX_VIDEO_SIZE } from "@/constants";
import {
  getThumbnailUploadUrl,
  getVideoUploadUrl,
  saveVideoDetails,
} from "@/lib/actions/video";

const uploadFileToBunny = (
  file: File,
  uploadUrl: string,
  accessKey: string,
): Promise<void> => {
  return fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
      AccessKey: accessKey,
    },
    body: file,
  }).then((response) => {
    if (!response.ok) throw new Error("Upload Failed");
  });
};

const Page = () => {
  const router = useRouter();

  const video = useFileInput(MAX_VIDEO_SIZE);
  const thumbnail = useFileInput(MAX_THUMBNAIL_SIZE);

  const [videoDuration, setVideoDuration] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    visibility: "public",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (video.duration !== null || 0) {
      setVideoDuration(video.duration);
    }
  }, [video.duration]);

  useEffect(() => {
    const checkForRecordedVideo = async () => {
      try {
        const stored = sessionStorage.getItem("recordedVideo");

        if (!stored) return;

        const { url, name, type, duration } = JSON.parse(stored);
        const blob = await fetch(url).then((res) => res.blob());

        const file = new File([blob], name, { type, lastModified: Date.now() });

        if (video.inputRef.current) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);

          video.inputRef.current.files = dataTransfer.files;

          const event = new Event("change", { bubbles: true });

          video.inputRef.current.dispatchEvent(event);

          video.handleFileChange({
            target: { files: dataTransfer.files },
          } as ChangeEvent<HTMLInputElement>);

          if (duration) {
            setVideoDuration(duration);
          }

          sessionStorage.removeItem("recordedVideo");
          URL.revokeObjectURL(url);
        }
      } catch (error) {
        console.error("Error loading recorded video");
      }
    };

    checkForRecordedVideo();
  }, [video]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!video.file || !thumbnail.file) {
        setError("Please upload video and thumbnail");
        return;
      }

      if (!formData.title || !formData.description) {
        setError("Please fill in all the details");
        return;
      }

      // get upload url
      const {
        videoId,
        uploadUrl: videoUploadUrl,
        accessKey: videoAccessKey,
      } = await getVideoUploadUrl();

      if (!videoUploadUrl || !videoAccessKey) {
        throw new Error("Failed to get video upload credentials");
      }

      // Upload the thumbnail to DB
      await uploadFileToBunny(video.file, videoUploadUrl, videoAccessKey);

      // aAttach thumbnail
      const {
        uploadUrl: thumbnailUploadUrl,
        accessKey: thumbnailAccessKey,
        cdnUrl: thumbnailCDNUrl,
      } = await getThumbnailUploadUrl(videoId);

      if (!thumbnailUploadUrl || !thumbnailCDNUrl || !thumbnailAccessKey) {
        throw new Error("Failed to get thumbnail upload credentials");
      }

      await uploadFileToBunny(
        thumbnail.file,
        thumbnailUploadUrl,
        thumbnailAccessKey,
      );

      await saveVideoDetails({
        videoId,
        thumbnailUrl: thumbnailCDNUrl,
        ...formData,
        duration: videoDuration,
      });

      router.push("/");
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="upload-page mx-4 md:mx-20">
      {error && <div className="error-field">{error}</div>}

      <form
  onSubmit={handleSubmit}
  className="
    grid grid-cols-1 gap-8
    lg:grid-cols-3
  "
>
  {/* ================= LEFT SIDE ================= */}
  <div className="lg:col-span-2 flex flex-col gap-8">
    {/* Video Upload */}
    <div className="flex flex-col gap-3">
      <FileInput
        id="video"
        label="video file"
        accept="video/*"
        file={video.file}
        previewUrl={video.previewUrl}
        inputRef={video.inputRef}
        onChange={video.handleFileChange}
        onReset={video.resetFile}
        type="video"
      />

      <span className="text-sm text-gray-400 text-right">
        Maximum video upload size: <strong>500 MB</strong>
      </span>
    </div>

    {/* Thumbnail Preview Strip */}
    <div className="hidden lg:flex flex-col gap-3">
      <h2 className="text-sm font-medium text-gray-600">
        Thumbnail Upload
      </h2>

      {/* Desktop-only preview row */}
      <div className="flex gap-3 items-center">
        {/* Real Thumbnail */}
        <div className="w-28 aspect-video rounded-lg overflow-hidden bg-neutral-200 border border-gray-200 flex items-center justify-center">
          {thumbnail.previewUrl ? (
            <img
              src={thumbnail.previewUrl}
              alt="Thumbnail preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs text-gray-400">None</span>
          )}
        </div>

        {/* Dummy Placeholders */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-20 aspect-video rounded-lg border border-gray-200 bg-neutral-100"
          />
        ))}
      </div>
    </div>
  </div>

  {/* ================= RIGHT SIDE ================= */}
  <div className="lg:col-span-1 flex flex-col gap-5">
    {/* Thumbnail Input */}
    <div className="flex flex-col gap-1">
      <FileInput
        id="thumbnail"
        label="thumbnail image"
        accept="image/*"
        file={thumbnail.file}
        previewUrl={thumbnail.previewUrl}
        inputRef={thumbnail.inputRef}
        onChange={thumbnail.handleFileChange}
        onReset={thumbnail.resetFile}
        type="image"
      />

      <span className="text-sm text-gray-400 text-right">
        Maximum thumbnail upload size: <strong>10 MB</strong>
      </span>
    </div>

    {/* Metadata */}
    <FormField
      id="title"
      label="title"
      value={formData.title}
      onChange={handleInputChange}
      placeholder="Enter a clean and concise video title"
    />

    <FormField
      id="description"
      label="description"
      value={formData.description}
      onChange={handleInputChange}
      as="textarea"
      placeholder="Describe what this video is about"
    />

    <FormField
      id="visibility"
      label="visibility"
      value={formData.visibility}
      onChange={handleInputChange}
      as="select"
      options={[
        { value: "public", label: "Public" },
        { value: "private", label: "Private" },
      ]}
    />

    <button
      type="submit"
      disabled={isSubmitting}
      className="submit-button"
    >
      {isSubmitting ? "Uploading..." : "Upload Video"}
    </button>
  </div>
</form>

    </div>
  );
};

export default Page;
