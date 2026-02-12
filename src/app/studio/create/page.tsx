"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { MAX_THUMBNAIL_SIZE, MAX_VIDEO_SIZE } from "@/constants";
import { useUser } from "@/hooks/useUser";
import { useFile } from "@/hooks/useFile";
import { VideoFormValues, videoFormSchema } from "@/lib/validator";
import { createVideo } from "@/actions/videos";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormField, FormMessage } from "@/components/ui/form";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FileInput from "@/components/Forms/FormInput";

export default function VideoUpload() {
  const { user } = useUser();

  const video = useFile(MAX_VIDEO_SIZE, "videos");
  const thumbnail = useFile(MAX_THUMBNAIL_SIZE, "thumbnails");

  const [uploading, setUploading] = useState(false);

  const form = useForm<VideoFormValues>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: {
      title: "",
      description: "",
      visibility: "public",
    },
  });

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
    reset: resetForm,
  } = form;

  useEffect(() => {
    const loadRecordedVideo = async () => {
      try {
        const stored = sessionStorage.getItem("recordedVideo");
        if (!stored) return;

        const { url, name, type, duration } = JSON.parse(stored);
        const blob = await fetch(url).then((res) => res.blob());

        const file = new File([blob], name, {
          type,
          lastModified: Date.now(),
        });

        if (video.inputRef.current) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);

          video.inputRef.current.files = dataTransfer.files;
          video.inputRef.current.dispatchEvent(
            new Event("change", { bubbles: true }),
          );

          video.handleFileChange({
            target: { files: dataTransfer.files },
          } as ChangeEvent<HTMLInputElement>);
        }

        sessionStorage.removeItem("recordedVideo");
        URL.revokeObjectURL(url);
      } catch {
        console.error("Failed to load recorded video");
      }
    };

    loadRecordedVideo();
  }, [video]);

  const resetUploadForm = () => {
    resetForm();
    video.resetFile();
    thumbnail.resetFile();
  };

  const onSubmit = async (values: VideoFormValues) => {
    if (!video.file) {
      toast.error("Video is required");
      return;
    }

    if (!thumbnail.file) {
      toast.error("Thumbnail is required");
      return;
    }

    setUploading(true);

    const thumbnailResult = await thumbnail.uploadFile();
    const videoResult = await video.uploadFile();

    if (
      !thumbnailResult.url ||
      !thumbnailResult.fileId ||
      !videoResult.url ||
      !videoResult.fileId
    ) {
      throw new Error("Upload failed");
    }

    await createVideo({
      title: values.title,
      description: values.description,
      visibility: values.visibility,
      userId: user?.id!,
      video: {
        url: videoResult.url,
        id: videoResult.fileId,
        duration: videoResult.duration,
      },
      thumbnail: {
        url: thumbnailResult.url,
        id: thumbnailResult.fileId,
      },
    });

    resetUploadForm();
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="col-span-1 col-span-12 grid gap-8 p-4 lg:col-span-10 lg:grid-cols-3 lg:p-10"
        >
          <div className="col-span-1 h-auto lg:col-span-2 lg:h-[40rem]">
            <div className="flex flex-col gap-2">
              <FileInput
                id="video"
                accept="video/*"
                file={video.file}
                previewUrl={video.previewUrl}
                inputRef={video.inputRef}
                onChange={video.handleFileChange}
                onReset={video.resetFile}
                type="video"
              />

              <span className="text-right text-sm text-gray-400">
                Maximum video upload size: <strong>100 MB</strong>
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || uploading}
              className="mt-8 flex hidden h-16 w-full cursor-pointer items-center justify-center rounded bg-[var(--sb-hover)] font-semibold text-white transition-colors hover:bg-[var(--sb)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[var(--sb-hover)] lg:block"
            >
              Publish Video
            </button>
          </div>

          <div className="col-span-1 flex flex-col gap-4">
            <FileInput
              id="thumbnail"
              accept="image/*"
              file={thumbnail.file}
              previewUrl={thumbnail.previewUrl}
              inputRef={thumbnail.inputRef}
              onChange={thumbnail.handleFileChange}
              onReset={thumbnail.resetFile}
              type="image"
            />

            <span className="text-right text-sm text-gray-400">
              Maximum thumbnail upload size: <strong>5 MB</strong>
            </span>

            <FieldGroup className="gap-3">
              {/* Title */}
              <Field>
                <FieldLabel>Video Title</FieldLabel>
                <FormField
                  control={control}
                  name="title"
                  render={({ field }) => (
                    <>
                      <Input placeholder="Evil Rabbit" {...field} />
                      <FormMessage />
                    </>
                  )}
                />
              </Field>

              {/* Description */}
              <Field>
                <FieldLabel>Video Description</FieldLabel>
                <FormField
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <>
                      <Textarea
                        {...field}
                        placeholder="Add any additional description"
                        className="resize-none"
                      />
                      <FormMessage />
                    </>
                  )}
                />
              </Field>

              {/* Visibility */}
              <Field>
                <FieldLabel>Video Visibility</FieldLabel>
                <FormField
                  control={control}
                  name="visibility"
                  render={({ field }) => (
                    <>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-black/10 dark:border-white/10">
                          <SelectGroup>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                            <SelectItem value="unlisted">Unlisted</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </>
                  )}
                />
              </Field>
            </FieldGroup>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || uploading}
            className="block flex lg:h-16 text-sm py-3 w-full cursor-pointer items-center justify-center rounded bg-[var(--sb-hover)] font-semibold text-white transition-colors hover:bg-[var(--sb)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[var(--sb-hover)] lg:hidden"
          >
            Publish Video
          </button>
        </form>
      </Form>

      {uploading && (
        <UploadStatus
          uploading={uploading}
          vp={video.progress}
          tp={thumbnail.progress}
          onClose={() => setUploading(false)}
        />
      )}
    </>
  );
}

function UploadStatus({
  vp,
  tp,
  uploading,
  onClose,
}: {
  vp: number;
  tp: number;
  uploading: boolean;
  onClose: () => void;
}) {
  const [cachedVp, setCachedVp] = useState<number>(0);
  const [cachedTp, setCachedTp] = useState<number>(0);

  useEffect(() => {
    if (vp > 0) setCachedVp(vp);
  }, [vp]);

  useEffect(() => {
    if (tp > 0) setCachedTp(tp);
  }, [tp]);

  const done = uploading && cachedVp >= 100 && cachedTp >= 100;

  return (
    <div className="fixed right-4 bottom-4 z-50 w-56 rounded border border-white/10 bg-[#171717] p-4 shadow-xl backdrop-blur">
      <div className="flex flex-col gap-4 text-sm">
        <div className="flex items-center justify-between">
          <h1 className="font-medium text-white">
            {done ? "Upload complete" : "Uploading"}
          </h1>

          {done && (
            <button
              onClick={onClose}
              className="cursor-pointer text-white/50 transition hover:text-white"
              aria-label="Close"
            >
              ✕
            </button>
          )}
        </div>

        {cachedVp > 0 && <ProgressRow label="Video" progress={cachedVp} />}

        {cachedTp > 0 && <ProgressRow label="Thumbnail" progress={cachedTp} />}

        {done && (
          <p className="mt-4 text-xs text-white/50">
            You can safely close this panel
          </p>
        )}
      </div>
    </div>
  );
}

type ProgressRowProps = {
  label: string;
  progress: number;
};

function ProgressRow({ label, progress }: ProgressRowProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-white/70">
        <span>{label}</span>
        <span>{progress}%</span>
      </div>

      <div className="h-[6px] w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-white transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
